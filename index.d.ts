declare namespace atomicProduct {
    const DEPOSIT: string;
    const VERIFY: string;
    const IDENTIFY: string;
    const WITHHOLD: string;
}
declare namespace atomicSDK {
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
export { atomicProduct as Product, atomicSDK as Atomic };
//# sourceMappingURL=index.d.ts.map