export var Product: {
    IDENTIFY: string;
    WITHHOLD: string;
    VERIFY: string;
    DEPOSIT: string;
};
export namespace Atomic {
    function transact({ config, container, environmentOverride, onInteraction, onDataRequest, onFinish, onClose }?: {
        config: any;
        container?: any;
        environmentOverride?: any;
        onInteraction?: any;
        onDataRequest?: any;
        onFinish?: any;
        onClose?: any;
    }): {
        close: () => void;
    };
}
//# sourceMappingURL=index.d.ts.map