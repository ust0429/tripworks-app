// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// ApplePayセッションのモック
class MockApplePaySession {
  static STATUS_SUCCESS = 0;
  static STATUS_FAILURE = 1;
  static STATUS_INVALID_BILLING_POSTAL_ADDRESS = 2;
  static STATUS_INVALID_SHIPPING_POSTAL_ADDRESS = 3;
  static STATUS_INVALID_SHIPPING_CONTACT = 4;
  static STATUS_PIN_REQUIRED = 5;
  static STATUS_PIN_INCORRECT = 6;
  static STATUS_PIN_LOCKOUT = 7;

  static canMakePayments() {
    return true;
  }

  static supportsVersion() {
    return true;
  }

  static canMakePaymentsWithActiveCard() {
    return Promise.resolve(true);
  }

  constructor() {
    // 必要なメソッドをモック
    this.begin = jest.fn();
    this.abort = jest.fn();
    this.completeMerchantValidation = jest.fn();
    this.completePaymentMethodSelection = jest.fn();
    this.completeShippingContactSelection = jest.fn();
    this.completeShippingMethodSelection = jest.fn();
    this.completePayment = jest.fn();
    
    // イベントハンドラ
    this.onvalidatemerchant = jest.fn();
    this.onpaymentmethodselected = jest.fn();
    this.onshippingcontactselected = jest.fn();
    this.onshippingmethodselected = jest.fn();
    this.onpaymentauthorized = jest.fn();
    this.oncancel = jest.fn();
  }

  begin = jest.fn();
  abort = jest.fn();
  completeMerchantValidation = jest.fn();
  completePaymentMethodSelection = jest.fn();
  completeShippingContactSelection = jest.fn();
  completeShippingMethodSelection = jest.fn();
  completePayment = jest.fn();
  
  onvalidatemerchant = jest.fn();
  onpaymentmethodselected = jest.fn();
  onshippingcontactselected = jest.fn();
  onshippingmethodselected = jest.fn();
  onpaymentauthorized = jest.fn();
  oncancel = jest.fn();
}

// グローバルオブジェクトにApplePaySessionをモックとして追加
global.ApplePaySession = MockApplePaySession;

// toBeInTheDocument が使えるように matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 非推奨
    removeListener: jest.fn(), // 非推奨
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
