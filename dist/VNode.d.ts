declare type StringOrStringArray = string | string[];
export declare const removeSurroundingSlashes: (input: string) => string;
export declare enum VNodeType {
    file = 0,
    directory = 1
}
export declare class VNode {
    name: string;
    parent?: VNode;
    constructor(name: string);
    serialize(path: string): Promise<void>;
}
export declare class VFile extends VNode {
    contents: string;
    constructor(name: string, contents?: string);
    serialize(path: string): Promise<void>;
}
export declare class VDir extends VNode {
    children: VNode[];
    constructor(name: string, children?: VNode[]);
    /** find a VNode under this directory using a path e.g. src/index.js */
    find(path: StringOrStringArray): VNode | null;
    serialize(path: string): Promise<void>;
}
export declare class VRoot extends VDir {
    constructor(children?: VNode[]);
}
export declare enum VConfigType {
    json = 0,
    yaml = 1
}
export declare class VConfig extends VFile {
    contents: any;
    type: VConfigType;
    constructor(name: string, type: VConfigType, contents: any);
    serialize(path: string): Promise<void>;
    read(path: string): any;
    write(path: string, value: any): any;
}
export declare type VPackageJsonConfig = {
    name?: string;
    repository?: string;
    author?: string;
};
export declare class VPackageJson extends VConfig {
    config: VPackageJsonConfig;
    constructor(config: VPackageJsonConfig, contents?: any);
    renderContents(existing: any): any;
    serialize(path: string): Promise<void>;
}
export {};
