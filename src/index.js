/* eslint-disable no-console */

import { extname } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs-extra';
import StylesProcessor from './StylesProcessor';
import defaultPreProcessors from './defaultPreProcessors';

export default function litStyles(options = {}) {
    const {
        extensions: inputExtensions = [ `.css`, `.scss`, `.sass`, `.pcss` ],
        preProcessors: inputPreProcessors = Object.keys(defaultPreProcessors)
    } = options;

    const extensions = StylesProcessor.normalizeExtensions(inputExtensions);

    const preProcessors = inputPreProcessors.map(preProcessor => {
        if (typeof preProcessor === `string`) {
            if (preProcessor in defaultPreProcessors) {
                return defaultPreProcessors[preProcessor];
            }
            throw new Error(`Unknown named pre-processor: ${preProcessor}. Expected one of [${Object.keys(defaultPreProcessors).join(`, `)}]`);
        }
        return new StylesProcessor(preProcessor);
    });

    return {
        name: `lit-styles`,
        async load(id) {
            const idExtension = extname(id);
            if (extensions.includes(idExtension)) {
                // Load the CSS file
                let styles = (await promisify(readFile)(id)).toString();

                // Process the CSS using the configured pre-processors
                for (let i = 0; i < preProcessors.length; i++) {
                    const preProcessor = preProcessors[i];

                    // Skip processors which do not process this file type
                    if (!preProcessor.doesProcess(idExtension)) {
                        continue;
                    }

                    // Process the current styles using the processor
                    const {
                        styles: newStyles = styles,
                        watchFiles = [],
                        warnings = []
                    } = await preProcessor.process({
                        pluginOptions: options,
                        moduleId: id,
                        styles
                    });

                    // Log any warnings
                    warnings.forEach(warn => console.warn(warn));

                    // Watch any files that the processor indicated should be watched
                    watchFiles.forEach(watchId => this.addWatchFile(watchId));

                    // Update the styles with the latest processing
                    styles = newStyles;
                }

                // Generate the JS module
                const litElementModule = await this.resolve(`lit-element`);
                return `
                    import { css } from '${litElementModule.id.replace(/\\/g, `\\\\`)}';
                    export default css\`${styles}\`
                `;
            }

            return null;
        }
    };
}
