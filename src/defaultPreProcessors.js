import { dirname } from 'path';
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

export default defaultPreProcessors;
