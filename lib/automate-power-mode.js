'use babel'

import path from 'path'
import { CompositeDisposable, Disposable } from 'atom'

const CPS_THRESHOLD = 5.5
const CHECK_INTERVAL = 1000

export default {
  powerEditor: null,
  subscriptions: null,
  timer: null,
  changes: 0,
  active: false,

  activate(state) {
    if (atom.packages.isPackageLoaded('activate-power-mode')) {
      const activatePowerMode = atom.packages.resolvePackagePath('activate-power-mode')
      const powerEditorPath = path.join(activatePowerMode, 'lib', 'power-editor')
      this.powerEditor = require(powerEditorPath)
      if (this.powerEditor) this.setup()
    }
  },

  deactivate() {
    if (this.subscriptions) this.subscriptions.dispose()
    if (this.timer) clearInterval(this.timer)
  },

  setup() {
    const threshold = CPS_THRESHOLD * (CHECK_INTERVAL / 1000)

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      editor.onDidChange(() => this.changes++)
    }))

    this.timer = setInterval(() => {
      if (this.changes > threshold) {
        if (!this.active) {
          this.powerEditor.enable()
          this.active = true
        }
      } else {
        if (this.active) {
          this.powerEditor.disable()
          this.active = false
        }
      }
      this.changes = 0
    }, CHECK_INTERVAL)
  }
}
