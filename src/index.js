/* eslint-disable no-console */

import { extname, dirname } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs-extra';
import postcss from 'postcss';
import sass from 'sass';
import StylesProcessor from './StylesProcessor';

const defaultPreProcessors = {
    sass: new StylesProcessor({
        extensions: [ `.scss`, `.sass` ],
        async process(options = {}) {
            const {
                pluginOptions,
                moduleId,
                styles
            } = options;

            pluginOptions.sass = pluginOptions.sass || {};

            // Note: we use renderSync because it is 'almost twice as fast as render'
            // (see: https://sass-lang.com/documentation/js-api#render)
            const result = sass.renderSync({
                ...pluginOptions.sass,
                data: styles.toString(),
                includePaths: [ dirname(moduleId), ...(pluginOptions.sass.includePaths || []) ]
            });

            return {
                styles: result.css,
                watchFiles: result.stats.includedFiles
            };
        }
    }),
    postcss: new StylesProcessor({
        extensions: [ `*` ],
        async process(options = {}) {
            const {
                pluginOptions,
                moduleId,
                styles
            } = options;

            pluginOptions.postcss = pluginOptions.postcss || {};

            if (!pluginOptions.postcssPlugins || pluginOptions.postcssPlugins.length === 0) {
                return styles;
            }

            const result = await postcss(pluginOptions.postcssPlugins)
                .process(styles, {
                    ...pluginOptions.postcss,
                    from: moduleId
                });

            return {
                styles: result.css.toString(),
                watchFiles: result.messages
                    .filter(message => message.type === `dependency` && message.file)
                    .map(message => message.file),
                warnings: result.warnings()
            };
        }
    })
};

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
