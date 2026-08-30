type TestID = {
  /**
   * Test id that can be used to select element in testing environments
   *
   * Checkout https://testing-library.com/docs/queries/bytestid/
   */
  testID?: string;
};

type ElementTiming = {
  /**
   * Element timing that can be used to track the performance of the component
   *
   * Checkout https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/elementtiming
   */
  elementtiming?: string;
};

export type {
    TestID,
    ElementTiming
}