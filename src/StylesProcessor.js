class StylesProcessor {
    static normalizeExtensions(extensions) {
        return extensions.map(ext => (ext === `*` || ext.startsWith(`.`) ? ext : `.${ext}`));
    }

    constructor(options = {}) {
        const {
            extensions = [],
            processor = () => {}
        } = options;

        this._extensions = StylesProcessor.normalizeExtensions(extensions);
        this._processesAll = this._extensions.includes(`*`);
        this._processor = processor;
    }

    async process() {
        return this._processor();
    }

    doesProcess(extension) {
        return this._processesAll || this.extensions.includes(extension);
    }
}

export default StylesProcessor;
