class StylesProcessor {
    static normalizeExtensions(extensions) {
        return extensions.map(ext => (ext === `*` || ext.startsWith(`.`) ? ext : `.${ext}`));
    }

    constructor(options = {}) {
        const {
            extensions = [],
            process = async () => {}
        } = options;

        this._extensionsMap = StylesProcessor.normalizeExtensions(extensions)
            .reduce((acc, ext) => ({ ...acc, [ext]: true }), {});
        this._processesAll = `*` in this._extensionsMap;
        this._process = process;
    }

    async process(options) {
        return (await this._process(options)) || {};
    }

    doesProcess(extension) {
        return this._processesAll || extension in this._extensionsMap;
    }
}

export default StylesProcessor;
