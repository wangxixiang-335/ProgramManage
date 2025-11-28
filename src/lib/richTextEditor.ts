// 富文本编辑器工具类
export class RichTextEditor {
  // 插入图片
  static insertImage(file: File, editableElement: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imgElement = document.createElement('img');
          imgElement.src = e.target?.result as string;
          imgElement.alt = file.name;
          imgElement.style.maxWidth = '100%';
          imgElement.style.height = 'auto';
          imgElement.style.borderRadius = '8px';
          imgElement.style.margin = '10px 0';
          
          // 在光标位置插入图片
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(imgElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // 如果没有光标，直接添加到末尾
            editableElement.appendChild(imgElement);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.readAsDataURL(file);
    });
  }

  // 执行格式化命令
  static executeCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
  }

  // 加粗
  static bold(): void {
    this.executeCommand('bold');
  }

  // 斜体
  static italic(): void {
    this.executeCommand('italic');
  }

  // 下划线
  static underline(): void {
    this.executeCommand('underline');
  }

  // 插入标题
  static insertHeading(level: number): void {
    this.executeCommand('formatBlock', `h${level}`);
  }

  // 插入段落
  static insertParagraph(): void {
    this.executeCommand('formatBlock', 'p');
  }

  // 插入链接
  static insertLink(url: string, text?: string): void {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || text || url;
    
    if (selection && selection.rangeCount > 0) {
      this.executeCommand('createLink', url);
    } else {
      const link = `<a href="${url}" target="_blank">${selectedText}</a>`;
      this.executeCommand('insertHTML', link);
    }
  }

  // 插入表格
  static insertTable(rows: number, cols: number): void {
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        const cellTag = i === 0 ? 'th' : 'td';
        tableHTML += `<${cellTag} style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cellTag === 'th' ? '标题' : '内容'}</${cellTag}>`;
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    this.executeCommand('insertHTML', tableHTML);
  }

  // 插入列表
  static insertList(ordered: boolean = false): void {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    this.executeCommand(command);
  }

  // 插入代码块
  static insertCodeBlock(code: string): void {
    const codeHTML = `<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; margin: 10px 0;"><code>${code}</code></pre>`;
    this.executeCommand('insertHTML', codeHTML);
  }

  // 插入引用块
  static insertBlockquote(text: string): void {
    const blockquoteHTML = `<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 20px; color: #666;">${text}</blockquote>`;
    this.executeCommand('insertHTML', blockquoteHTML);
  }

  // 清除格式
  static removeFormat(): void {
    this.executeCommand('removeFormat');
  }

  // 获取HTML内容
  static getHTML(element: HTMLElement): string {
    return element.innerHTML;
  }

  // 设置HTML内容
  static setHTML(element: HTMLElement, html: string): void {
    element.innerHTML = html;
  }

  // 获取纯文本内容
  static getText(element: HTMLElement): string {
    return element.textContent || '';
  }

  // 检查当前格式状态
  static getFormatState(): {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    link: boolean;
    list: boolean;
  } {
    return {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      link: document.queryCommandState('createLink'),
      list: document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')
    };
  }
}

export default RichTextEditor;