/// <reference types="react" />
declare type ReaderState = {
    [msg: string]: {
        focused: boolean;
        handlers: {
            onFocus: () => void;
            onBlur: () => void;
        };
    };
};
export declare const actionTypes: {
    FOCUS: string;
    BLUR: string;
    SET: string;
};
export declare const elementReducer: (state: ReaderState, action: any) => ReaderState;
export declare const AriaLiveMessage: (props: any) => JSX.Element;
declare const useScreenReader: () => {
    a11y: () => JSX.Element | null;
    reader: (message: string) => {
        onFocus: () => void;
        onBlur: () => void;
    };
    read: (message: string) => void;
};
export default useScreenReader;
