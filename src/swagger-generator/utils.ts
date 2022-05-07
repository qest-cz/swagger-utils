export const isDocFragmentExists = (docFragments: unknown | { paths: string[] }): docFragments is { paths: string[] } => !!docFragments;
