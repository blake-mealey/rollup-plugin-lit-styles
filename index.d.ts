import rollup from 'rollup';

interface LitStylesOptions {
    /**
     * An option.
     * @default "defaultValue"
     */
    readonly optionName?: string;
}

/**
 * Lit styles rollup plugin
 */
export default function litStyles(options?: LitStylesOptions): rollup.Plugin;
