import fs from 'node:fs'

class Dialogue {
  private lineRegex = /\[(.*?)\](.*)/
  private script: string[]
  public currentLine: number
  public length: number

  constructor(script: string, isFile: boolean = true) {
    if (isFile)
      this.script = fs.readFileSync(script, 'utf-8').split('\n')
    else this.script = script.split('\n')
    this.length = this.script.length
    this.currentLine = 0
  }

  private getLine(index: number): Array<string> {
    const line = index >= this.script.length ? '' : this.script[index]
    return line.match(this.lineRegex) ?? ['', '']
  }

  public getSpeaker(line: number = this.currentLine): string {
    return this.getLine(line)[1]?.trim() ?? ''
  }

  public getNextLine(line: number = this.currentLine): string {
    this.currentLine++
    return this.getLine(line)[2]?.trim() ?? ''
  }
}

export {
  Dialogue,
}
