export const ADSENSE_PUBLISHER_ID = 'pub-5252543031076112';
export const ADSENSE_ACCOUNT_ID = `ca-${ADSENSE_PUBLISHER_ID}`;
export const ADSENSE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0';
export const ADSENSE_SCRIPT_URL =
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ACCOUNT_ID}`;
export const ADSENSE_ADS_TXT_RECORD =
  `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, ${ADSENSE_CERTIFICATION_AUTHORITY_ID}`;
export const ADSENSE_ADS_TXT_CONTENT = `${ADSENSE_ADS_TXT_RECORD}\n`;
