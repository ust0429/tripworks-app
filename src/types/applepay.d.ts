interface ApplePayJS {
    ApplePaySession: typeof ApplePaySession;
    ApplePayError: typeof ApplePayError;
    ApplePayErrorCode: typeof ApplePayErrorCode;
    ApplePayErrorContactField: typeof ApplePayErrorContactField;
    ApplePayLineItem: ApplePayLineItem;
    ApplePayPaymentRequest: ApplePayPaymentRequest;
    ApplePayPaymentMethod: ApplePayPaymentMethod;
    ApplePayPaymentContact: ApplePayPaymentContact;
}

declare class ApplePaySession {
    static STATUS_SUCCESS: number;
    static STATUS_FAILURE: number;
    static STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
    static STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
    static STATUS_INVALID_SHIPPING_CONTACT: number;
    static STATUS_PIN_REQUIRED: number;
    static STATUS_PIN_INCORRECT: number;
    static STATUS_PIN_LOCKOUT: number;

    static supportsVersion(version: number): boolean;
    static canMakePayments(): boolean;
    static canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;

    constructor(version: number, paymentRequest: ApplePayPaymentRequest);
    
    begin(): void;
    abort(): void;
    completeMerchantValidation(merchantSession: any): void;
    completePaymentMethodSelection(newTotal: ApplePayLineItem, newLineItems: ApplePayLineItem[]): void;
    completeShippingContactSelection(status: number, newShippingMethods: ApplePayShippingMethod[], newTotal: ApplePayLineItem, newLineItems: ApplePayLineItem[]): void;
    completeShippingMethodSelection(status: number, newTotal: ApplePayLineItem, newLineItems: ApplePayLineItem[]): void;
    completePayment(status: number): void;

    onvalidatemerchant: (event: ApplePayValidateMerchantEvent) => void;
    onpaymentmethodselected: (event: ApplePayPaymentMethodSelectedEvent) => void;
    onshippingcontactselected: (event: ApplePayShippingContactSelectedEvent) => void;
    onshippingmethodselected: (event: ApplePayShippingMethodSelectedEvent) => void;
    onpaymentauthorized: (event: ApplePayPaymentAuthorizedEvent) => void;
    oncancel: (event: Event) => void;
}

interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    supportedNetworks: string[];
    merchantCapabilities: string[];
    total: ApplePayLineItem;
    lineItems?: ApplePayLineItem[];
    requiredBillingContactFields?: string[];
    requiredShippingContactFields?: string[];
    shippingMethods?: ApplePayShippingMethod[];
    shippingType?: string;
    applicationData?: string;
    billingContact?: ApplePayPaymentContact;
    shippingContact?: ApplePayPaymentContact;
}

interface ApplePayLineItem {
    type: 'final' | 'pending';
    label: string;
    amount: string;
}

interface ApplePayShippingMethod {
    label: string;
    detail: string;
    amount: string;
    identifier: string;
}

interface ApplePayPaymentMethod {
    displayName: string;
    network: string;
    type: string;
}

interface ApplePayPaymentContact {
    phoneNumber?: string;
    emailAddress?: string;
    givenName?: string;
    familyName?: string;
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    countryCode?: string;
}

interface ApplePayValidateMerchantEvent extends Event {
    validationURL: string;
}

interface ApplePayPaymentMethodSelectedEvent extends Event {
    paymentMethod: ApplePayPaymentMethod;
}

interface ApplePayShippingContactSelectedEvent extends Event {
    shippingContact: ApplePayPaymentContact;
}

interface ApplePayShippingMethodSelectedEvent extends Event {
    shippingMethod: ApplePayShippingMethod;
}

interface ApplePayPaymentAuthorizedEvent extends Event {
    payment: ApplePayPayment;
}

interface ApplePayPayment {
    token: ApplePayPaymentToken;
    billingContact?: ApplePayPaymentContact;
    shippingContact?: ApplePayPaymentContact;
}

interface ApplePayPaymentToken {
    paymentMethod: ApplePayPaymentMethod;
    paymentData: any;
    transactionIdentifier: string;
}

declare class ApplePayError extends Error {
    constructor(errorCode: number, contactField: string, message: string);
}

declare const ApplePayErrorCode: {
    BILLING_CONTACT_INVALID: number;
    SHIPPING_CONTACT_INVALID: number;
    ADDRESS_UNSERVICEABLE: number;
    SHIPPING_ADDRESS_UNSERVICEABLE: number;
    UNKNOWN: number;
};

declare const ApplePayErrorContactField: {
    PHONE_NUMBER: string;
    EMAIL_ADDRESS: string;
    NAME: string;
    POSTAL_ADDRESS: string;
    ADDRESS_LINES: string;
    LOCALITY: string;
    SUBLOCALITY: string;
    POSTAL_CODE: string;
    ADMINISTRATIVE_AREA: string;
    COUNTRY: string;
};

interface Window {
    ApplePaySession?: typeof ApplePaySession;
}
