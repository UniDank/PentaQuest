import Phaser from 'phaser'
import WebFontLoader from 'webfontloader'

export default class WebFontFile extends Phaser.Loader.File {
  fontNames: string | string[]
  service: string
  sources: string | string[]

  constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string | string[], service: string = 'google', sources: string | string[] = '') {
    super(loader, {
      type: 'webfont',
      key: fontNames.toString(),
    })
    this.fontNames = Array.isArray(fontNames) ? fontNames : [fontNames]
    this.service = service
    this.sources = sources
  }

  load() {
    const config: any = {
      active: () => {
        this.loader.nextFile(this, true)
      },
    }

    switch (this.service) {
      case 'google':
        config.google = {
          families: this.fontNames,
        }
        break
      case 'custom':
        config.custom = {
          families: this.fontNames,
          urls: this.sources,
        }
        break
      default:
        throw new Error('Unsupported font service')
    }

    WebFontLoader.load(config)
  }
}
