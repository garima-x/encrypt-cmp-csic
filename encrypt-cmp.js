/**
 * ENCRYPT CMP — Full-Featured Embeddable SDK v2.0
 * CSIC 1.0 MVP | Cluster 9: Governance, Operations & Privacy
 * DPDP Act 2023 (India) + GDPR (EU) Compliant
 *
 * Features: Banner · Purpose Modal · Privacy Risk Meter · Data Rights Panel
 *           Vendor Modal · Consent Duration · 5 Languages · Supabase · Blockchain
 *
 * Usage:
 *   <script src="encrypt-cmp.js"
 *     data-org="MyApp"
 *     data-lang="en"
 *     data-supabase-url="https://xxx.supabase.co"
 *     data-supabase-key="YOUR_ANON_KEY">
 *   </script>
 *
 * API: window.EncryptCMP
 *   .getConsent()           → purposes object
 *   .revokeConsent(purpose) → revoke one purpose
 *   .revokeAll()            → revoke all
 *   .showBanner()           → re-show banner
 *   .getReceipt()           → last consent receipt JSON
 *   .setLang(lang)          → switch language
 */
(function (w, d) {
  "use strict";

  const script = d.currentScript || d.querySelector("script[data-org]");
  const CFG = {
    org:         script?.getAttribute("data-org")          || "ENCRYPT CMP",
    lang:        script?.getAttribute("data-lang")         || "en",
    sbUrl:       script?.getAttribute("data-supabase-url") || "https://lykbbpgctjmjkkdrnshu.supabase.co",
    sbKey:       script?.getAttribute("data-supabase-key") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a2JicGdjdGptamtrZHJuc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjcyNzIsImV4cCI6MjA4MTA0MzI3Mn0.U7UpV-PAyuJYzHivzmwcflT0Aj0U2ypihM4sdhNfbdw",
    policyVersion: script?.getAttribute("data-policy-version")  || "1.0.0",
  };

  // ── STATE ───────────────────────────────────────────────────────────────
  let lang = CFG.lang;
  let model = "gdpr";   // "gdpr" | "dpdp"
  let db = null;
  let lastReceipt = null;
  let deviceId = localStorage.getItem("_ecmp_did") || crypto.randomUUID();
  localStorage.setItem("_ecmp_did", deviceId);

  let ps = { necessary:true, analytics:false, marketing:false, personalization:false, third_party_sharing:false };
  const saved = localStorage.getItem("_ecmp_ps");
  if (saved) try { Object.assign(ps, JSON.parse(saved)); } catch{}

  // ── TRANSLATIONS ─────────────────────────────────────────────────────────
  const TR = {
    en:{
      bannerTitle: "🔒 ENCRYPT CMP",
      bannerText:"We use cookies and similar technologies for essential functionality, analytics, marketing, personalization, and third‑party services.",
      btnReject:"I Disagree", btnCustomize:"Customize", btnAccept:"Accept All",
      modalTitle:"Privacy Preferences",
      btnOptOutAll:"Opt‑Out All Non‑Essential", btnRestore:"Restore Recommended", btnSave:"Save Preferences",
      settingsBtn:"⚙️ Privacy Settings", toastSaved:"Preferences saved",
      regionBadgeGDPR:"Detected region: EU (GDPR)", regionBadgeDPDP:"Detected region: India (DPDP)",
      dpdpNote:"Under India's DPDP Act, consent must be explicit and time‑bound.",
      rightsNote:"Your Rights:", rightsNoteBody:"In case of a privacy incident, you will be notified as per",
      rightsNoteBody2:"rules. You may request a copy of your consent receipt at any time.",
      rightsTitle:"🛡️ Your Data Rights",
      rightsIntro:"You have the right to control how your personal data is used. Under DPDP and GDPR, you can:",
      rightsAccess:"📄 Access: Request a copy of your personal data.",
      rightsRectification:"✏️ Rectification: Correct inaccurate or incomplete data.",
      rightsErasure:"🗑️ Erasure: Request deletion of your data.",
      rightsRestriction:"⛔ Restriction: Limit how your data is used.",
      rightsObjection:"🚫 Objection: Opt out of marketing or profiling.",
      rightsPortability:"🔄 Portability: Export your data in a readable format.",
      rightsWithdraw:"🔓 Withdraw Consent: Change your preferences anytime.",
      rightsContact:"To exercise any of these rights, contact our Data Protection Officer or use the consent dashboard.",
      rightsClose:"Close",
      riskTitle:"Privacy Risk", riskLow:"Low Risk", riskMedium:"Medium Risk", riskHigh:"High Risk",
      riskKeyFactors:"Key factors:", riskOnlyNecessary:"Only strictly necessary processing is active.",
      riskDefaultRec:"Current settings use only minimal data.",
      riskFactorAnalytics:"Analytics enabled: behavioral tracking active",
      riskFactorMarketing:"Marketing enabled: profiling and targeted ads",
      riskFactorPersonalization:"Personalization enabled: preference-based profiling",
      riskFactorThirdParty:"Third‑party sharing enabled: external vendors receive data",
      riskRecHighDPDPThird:"High risk under DPDP: consider disabling Third‑party Sharing.",
      riskRecHighGDPRThird:"High risk under GDPR: consider disabling Third‑party Sharing.",
      riskRecHighMarketing:"High profiling risk: consider disabling Marketing cookies.",
      riskRecMedium:"Medium risk: limiting Marketing or Personalization will reduce tracking.",
      riskRecLowDPDP:"Low risk: current settings align with minimal data collection under DPDP.",
      riskRecLowGDPR:"Low risk: current settings use only limited data under GDPR.",
      vendorModalTitle:"Vendors and Data Sharing", vendorPurposeLabel:"Purpose:",
      vendorDataLabel:"Data shared:", vendorNotSpecified:"Not specified",
      vendorNone:"No external vendors are currently used.", vendorError:"Unable to load vendor data.",
      vendorClose:"Close", viewVendorsBtn:"View vendors & data sharing →", viewRightsBtn:"View Your Rights →",
      consentDurationLabel:"Consent duration", duration24h:"24 hours", duration30d:"1 month", duration365d:"1 year",
      purposeLabels:{ necessary:"Necessary", analytics:"Analytics", marketing:"Marketing", personalization:"Personalization", third_party_sharing:"Third‑party Sharing" },
      purposeDescs:{ necessary:"Required for security, fraud prevention and core functionality. Cannot be disabled.", analytics:"Helps us understand how visitors use the site.", marketing:"Used to deliver relevant advertisements.", personalization:"Remembers your preferences like language and layout.", third_party_sharing:"Limited data sharing with trusted partners." },
      poweredBy:"Powered by ENCRYPT CMP · CSIC 1.0",
    },
    hi:{
      bannerTitle: "🔒 ENCRYPT CMP",
      bannerText:"हम आवश्यक कार्यक्षमता, विश्लेषण, मार्केटिंग, निजीकरण और तृतीय‑पक्ष सेवाओं के लिए कुकीज़ का उपयोग करते हैं।",
      btnReject:"मैं असहमत हूँ", btnCustomize:"कस्टमाइज़ करें", btnAccept:"सभी स्वीकार करें",
      modalTitle:"गोपनीयता प्राथमिकताएँ",
      btnOptOutAll:"सभी गैर‑आवश्यक बंद करें", btnRestore:"अनुशंसित सेटिंग्स पुनर्स्थापित करें", btnSave:"प्राथमिकताएँ सहेजें",
      settingsBtn:"⚙️ गोपनीयता सेटिंग्स", toastSaved:"प्राथमिकताएँ सहेजी गईं",
      regionBadgeGDPR:"पता लगाया गया क्षेत्र: यूरोपीय संघ (GDPR)", regionBadgeDPDP:"पता लगाया गया क्षेत्र: भारत (DPDP)",
      dpdpNote:"भारत के DPDP अधिनियम के तहत, सहमति स्पष्ट और समय-सीमित होनी चाहिए।",
      rightsNote:"आपके अधिकार:", rightsNoteBody:"गोपनीयता घटना की स्थिति में, आपको", rightsNoteBody2:"नियमों के अनुसार सूचित किया जाएगा।",
      rightsTitle:"🛡️ आपके डेटा अधिकार", rightsIntro:"DPDP और GDPR के तहत आप यह कर सकते हैं:",
      rightsAccess:"📄 पहुँच: अपने डेटा की प्रति मांगें।", rightsRectification:"✏️ सुधार: गलत डेटा ठीक करें।",
      rightsErasure:"🗑️ मिटाना: डेटा हटाने का अनुरोध करें।", rightsRestriction:"⛔ प्रतिबंध: डेटा उपयोग सीमित करें।",
      rightsObjection:"🚫 आपत्ति: मार्केटिंग से बाहर निकलें।", rightsPortability:"🔄 पोर्टेबिलिटी: डेटा निर्यात करें।",
      rightsWithdraw:"🔓 सहमति वापस लें: कभी भी प्राथमिकताएँ बदलें।",
      rightsContact:"इनमें से किसी भी अधिकार के लिए डेटा सुरक्षा अधिकारी से संपर्क करें।",
      rightsClose:"बंद करें",
      riskTitle:"गोपनीयता जोखिम", riskLow:"कम जोखिम", riskMedium:"मध्यम जोखिम", riskHigh:"उच्च जोखिम",
      riskKeyFactors:"मुख्य कारक:", riskOnlyNecessary:"केवल आवश्यक प्रक्रियाएँ सक्रिय हैं।",
      riskDefaultRec:"वर्तमान सेटिंग्स न्यूनतम डेटा का उपयोग करती हैं।",
      riskFactorAnalytics:"विश्लेषण सक्षम: व्यवहार ट्रैकिंग", riskFactorMarketing:"मार्केटिंग सक्षम: प्रोफाइलिंग",
      riskFactorPersonalization:"निजीकरण सक्षम", riskFactorThirdParty:"तृतीय‑पक्ष साझाकरण सक्षम",
      riskRecHighDPDPThird:"DPDP के तहत उच्च जोखिम: तृतीय‑पक्ष साझाकरण अक्षम करें।",
      riskRecHighGDPRThird:"GDPR के तहत उच्च जोखिम: तृतीय‑पक्ष साझाकरण अक्षम करें।",
      riskRecHighMarketing:"मार्केटिंग से उच्च जोखिम: मार्केटिंग कुकीज़ अक्षम करें।",
      riskRecMedium:"मध्यम जोखिम: मार्केटिंग या निजीकरण सीमित करें।",
      riskRecLowDPDP:"कम जोखिम: DPDP के अनुरूप।", riskRecLowGDPR:"कम जोखिम: GDPR के अनुरूप।",
      vendorModalTitle:"विक्रेता और डेटा साझाकरण", vendorPurposeLabel:"उद्देश्य:", vendorDataLabel:"साझा किया गया डेटा:",
      vendorNotSpecified:"निर्दिष्ट नहीं", vendorNone:"कोई बाहरी विक्रेता नहीं।", vendorError:"विक्रेता डेटा लोड नहीं हुआ।",
      vendorClose:"बंद करें", viewVendorsBtn:"विक्रेता देखें →", viewRightsBtn:"अधिकार देखें →",
      consentDurationLabel:"सहमति अवधि", duration24h:"24 घंटे", duration30d:"1 महीना", duration365d:"1 वर्ष",
      purposeLabels:{ necessary:"आवश्यक", analytics:"विश्लेषण", marketing:"मार्केटिंग", personalization:"निजीकरण", third_party_sharing:"तृतीय‑पक्ष" },
      purposeDescs:{ necessary:"सुरक्षा और मुख्य कार्यक्षमता के लिए आवश्यक।", analytics:"वेबसाइट उपयोग समझने में मदद।", marketing:"प्रासंगिक विज्ञापन।", personalization:"भाषा और लेआउट याद।", third_party_sharing:"भागीदारों के साथ सीमित डेटा।" },
      poweredBy:"ENCRYPT CMP द्वारा संचालित · CSIC 1.0",
    },
    te:{
      bannerTitle: "🔒 ENCRYPT CMP",
      bannerText:"మేము అవసరమైన కార్యాచరణ, విశ్లేషణలు, మార్కెటింగ్, వ్యక్తిగతీకరణ మరియు మూడవ పక్ష సేవల కోసం కుకీలు ఉపయోగిస్తాము.",
      btnReject:"నేను అంగీకరించను", btnCustomize:"అనుకూలీకరించు", btnAccept:"అన్నీ అంగీకరించు",
      modalTitle:"గోప్యతా ప్రాధాన్యతలు",
      btnOptOutAll:"అనవసరవాటిని నిలిపివేయండి", btnRestore:"సిఫార్సులు పునరుద్ధరించండి", btnSave:"ప్రాధాన్యతలు సేవ్ చేయండి",
      settingsBtn:"⚙️ గోప్యతా సెట్టింగ్‌లు", toastSaved:"ప్రాధాన్యతలు సేవ్ చేయబడ్డాయి",
      regionBadgeGDPR:"గుర్తించిన ప్రాంతం: EU (GDPR)", regionBadgeDPDP:"గుర్తించిన ప్రాంతం: భారతదేశం (DPDP)",
      dpdpNote:"DPDP చట్టం ప్రకారం సమ్మతి స్పష్టంగా మరియు సమయ-పరిమితంగా ఉండాలి.",
      rightsNote:"మీ హక్కులు:", rightsNoteBody:"గోప్యతా సంఘటన విషయంలో", rightsNoteBody2:"నిబంధనల ప్రకారం తెలియజేయబడుతుంది.",
      rightsTitle:"🛡️ మీ డేటా హక్కులు", rightsIntro:"DPDP మరియు GDPR కింద మీకు హక్కులు ఉన్నాయి:",
      rightsAccess:"📄 యాక్సెస్: డేటా కాపీ అభ్యర్థించండి.", rightsRectification:"✏️ సవరణ: తప్పుడు డేటా సరిదిద్దండి.",
      rightsErasure:"🗑️ తొలగింపు: డేటా తొలగించమని అభ్యర్థించండి.", rightsRestriction:"⛔ నిషేధం: డేటా వినియోగం పరిమితం చేయండి.",
      rightsObjection:"🚫 అభ్యంతరం: మార్కెటింగ్ నుండి నిష్క్రమించండి.", rightsPortability:"🔄 పోర్టబిలిటీ: డేటా ఎగుమతి చేయండి.",
      rightsWithdraw:"🔓 సమ్మతి వెనక్కి తీసుకోండి.", rightsContact:"హక్కుల కోసం డేటా సంరక్షణ అధికారిని సంప్రదించండి.",
      rightsClose:"మూసివేయి",
      riskTitle:"గోప్యతా ప్రమాదం", riskLow:"తక్కువ ప్రమాదం", riskMedium:"మధ్యమ ప్రమాదం", riskHigh:"అధిక ప్రమాదం",
      riskKeyFactors:"ముఖ్య అంశాలు:", riskOnlyNecessary:"అవసరమైన ప్రక్రియలు మాత్రమే సక్రియం.",
      riskDefaultRec:"ప్రస్తుత సెట్టింగ్‌లు కనీస డేటా ఉపయోగిస్తున్నాయి.",
      riskFactorAnalytics:"విశ్లేషణలు సక్రియం", riskFactorMarketing:"మార్కెటింగ్ సక్రియం",
      riskFactorPersonalization:"వ్యక్తిగతీకరణ సక్రియం", riskFactorThirdParty:"మూడవ పక్ష భాగస్వామ్యం",
      riskRecHighDPDPThird:"DPDP: మూడవ పక్ష భాగస్వామ్యం నిలిపివేయండి.", riskRecHighGDPRThird:"GDPR: మూడవ పక్ష భాగస్వామ్యం నిలిపివేయండి.",
      riskRecHighMarketing:"మార్కెటింగ్ కుకీలు నిలిపివేయండి.", riskRecMedium:"మార్కెటింగ్ లేదా వ్యక్తిగతీకరణ పరిమితం చేయండి.",
      riskRecLowDPDP:"DPDP కింద కనీస డేటా.", riskRecLowGDPR:"GDPR కింద సీమిత డేటా.",
      vendorModalTitle:"విక్రేతలు మరియు డేటా భాగస్వామ్యం", vendorPurposeLabel:"ఉద్దేశం:", vendorDataLabel:"భాగస్వామ్యం చేసిన డేటా:",
      vendorNotSpecified:"పేర్కొనలేదు", vendorNone:"బాహ్య విక్రేతులు లేరు.", vendorError:"విక్రేత డేటా లోడ్ కాలేదు.",
      vendorClose:"మూసివేయి", viewVendorsBtn:"విక్రేతలు చూడండి →", viewRightsBtn:"హక్కులు చూడండి →",
      consentDurationLabel:"సమ్మతి వ్యవధి", duration24h:"24 గంటలు", duration30d:"1 నెల", duration365d:"1 సంవత్సరం",
      purposeLabels:{ necessary:"అవసరమైన", analytics:"విశ్లేషణలు", marketing:"మార్కెటింగ్", personalization:"వ్యక్తిగతీకరణ", third_party_sharing:"మూడవ పక్ష" },
      purposeDescs:{ necessary:"భద్రత మరియు ముఖ్య కార్యాచరణ కోసం అవసరం.", analytics:"వెబ్‌సైట్ వినియోగం అర్థం చేసుకోవడానికి.", marketing:"సంబంధిత ప్రకటనలు.", personalization:"భాష మరియు లేఅవుట్ ప్రాధాన్యతలు.", third_party_sharing:"విశ్వసనీయ భాగస్వాములతో సీమిత డేటా." },
      poweredBy:"ENCRYPT CMP ద్వారా · CSIC 1.0",
    },
    ta:{
      bannerTitle: "🔒 ENCRYPT CMP",
      bannerText:"அத்தியாவசிய செயல்பாடு, பகுப்பாய்வு, சந்தைப்படுத்தல், தனிப்பயனாக்கம் மற்றும் மூன்றாம் தரப்பு சேவைகளுக்காக குக்கீகளை பயன்படுத்துகிறோம்.",
      btnReject:"நான் ஒப்புக்கொள்ளவில்லை", btnCustomize:"தனிப்பயனாக்கு", btnAccept:"அனைத்தையும் ஏற்கவும்",
      modalTitle:"தனியுரிமை விருப்பத்தேர்வுகள்",
      btnOptOutAll:"தேவையற்றவற்றை நிறுத்து", btnRestore:"இயல்புநிலை மீட்டமை", btnSave:"விருப்பத்தேர்வுகளை சேமி",
      settingsBtn:"⚙️ தனியுரிமை அமைப்புகள்", toastSaved:"விருப்பத்தேர்வுகள் சேமிக்கப்பட்டன",
      regionBadgeGDPR:"கண்டறியப்பட்ட பிராந்தியம்: EU (GDPR)", regionBadgeDPDP:"கண்டறியப்பட்ட பிராந்தியம்: இந்தியா (DPDP)",
      dpdpNote:"DPDP சட்டத்தின்படி ஒப்புதல் வெளிப்படையாக இருக்க வேண்டும்.",
      rightsNote:"உங்கள் உரிமைகள்:", rightsNoteBody:"தனியுரிமை சம்பவம் ஏற்பட்டால்", rightsNoteBody2:"விதிகளின்படி அறிவிக்கப்படும்.",
      rightsTitle:"🛡️ உங்கள் தரவு உரிமைகள்", rightsIntro:"DPDP மற்றும் GDPR கீழ் உங்களுக்கு உரிமைகள் உள்ளன:",
      rightsAccess:"📄 அணுகல்: தரவின் நகல் கோரவும்.", rightsRectification:"✏️ திருத்தம்: தவறான தரவை சரிசெய்யவும்.",
      rightsErasure:"🗑️ நீக்கம்: தரவை நீக்குமாறு கோரவும்.", rightsRestriction:"⛔ கட்டுப்பாடு: தரவு பயன்பாட்டை வரையறுக்கவும்.",
      rightsObjection:"🚫 எதிர்ப்பு: சந்தைப்படுத்தலில் இருந்து விலகவும்.", rightsPortability:"🔄 பெயர்வுத்திறன்: தரவை ஏற்றுமதி செய்யவும்.",
      rightsWithdraw:"🔓 ஒப்புதலை திரும்பப் பெறவும்.", rightsContact:"உரிமைகளுக்கு தரவு பாதுகாப்பு அதிகாரியை தொடர்பு கொள்ளவும்.",
      rightsClose:"மூடு",
      riskTitle:"தனியுரிமை ஆபத்து", riskLow:"குறைந்த ஆபத்து", riskMedium:"மிதமான ஆபத்து", riskHigh:"அதிக ஆபத்து",
      riskKeyFactors:"முக்கிய காரணிகள்:", riskOnlyNecessary:"அத்தியாவசிய செயல்முறைகள் மட்டும்.",
      riskDefaultRec:"குறைந்தபட்ச தரவை பயன்படுத்துகின்றன.",
      riskFactorAnalytics:"பகுப்பாய்வு இயக்கம்", riskFactorMarketing:"சந்தைப்படுத்தல் இயக்கம்",
      riskFactorPersonalization:"தனிப்பயனாக்கம் இயக்கம்", riskFactorThirdParty:"மூன்றாம் தரப்பு பகிர்வு",
      riskRecHighDPDPThird:"DPDP: மூன்றாம் தரப்பை முடக்கவும்.", riskRecHighGDPRThird:"GDPR: மூன்றாம் தரப்பை முடக்கவும்.",
      riskRecHighMarketing:"சந்தைப்படுத்தல் குக்கீகளை முடக்கவும்.", riskRecMedium:"சந்தைப்படுத்தல் கட்டுப்படுத்தவும்.",
      riskRecLowDPDP:"குறைந்த ஆபத்து — DPDP இணக்கம்.", riskRecLowGDPR:"குறைந்த ஆபத்து — GDPR இணக்கம்.",
      vendorModalTitle:"விற்பனையாளர்கள் மற்றும் தரவு பகிர்வு", vendorPurposeLabel:"நோக்கம்:", vendorDataLabel:"பகிரப்பட்ட தரவு:",
      vendorNotSpecified:"குறிப்பிடவில்லை", vendorNone:"வெளி விற்பனையாளர்கள் யாரும் இல்லை.", vendorError:"விற்பனையாளர் தரவை ஏற்ற முடியவில்லை.",
      vendorClose:"மூடு", viewVendorsBtn:"விற்பனையாளர்கள் காண்க →", viewRightsBtn:"உரிமைகளை காண்க →",
      consentDurationLabel:"ஒப்புதல் காலம்", duration24h:"24 மணி நேரம்", duration30d:"1 மாதம்", duration365d:"1 ஆண்டு",
      purposeLabels:{ necessary:"அத்தியாவசியம்", analytics:"பகுப்பாய்வு", marketing:"சந்தைப்படுத்தல்", personalization:"தனிப்பயனாக்கம்", third_party_sharing:"மூன்றாம் தரப்பு" },
      purposeDescs:{ necessary:"பாதுகாப்பு மற்றும் முக்கிய செயல்பாட்டிற்கு தேவை.", analytics:"வலைத்தளம் புரிந்துகொள்ள.", marketing:"தொடர்புடைய விளம்பரங்கள்.", personalization:"மொழி விருப்பங்களை நினைவில் வைக்க.", third_party_sharing:"நம்பகமான கூட்டாளர்களுடன் குறைந்த தரவு." },
      poweredBy:"ENCRYPT CMP மூலம் · CSIC 1.0",
    },
    kn:{
      bannerTitle: "🔒 ENCRYPT CMP",
      bannerText:"ಅಗತ್ಯ ಕಾರ್ಯಕ್ಷಮತೆ, ವಿಶ್ಲೇಷಣೆ, ಮಾರ್ಕೆಟಿಂಗ್, ವೈಯಕ್ತಿಕಗೊಳಿಸುವಿಕೆ ಮತ್ತು ಮೂರನೇ ಪಕ್ಷ ಸೇವೆಗಳಿಗಾಗಿ ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತೇವೆ.",
      btnReject:"ನಾನು ಒಪ್ಪುವುದಿಲ್ಲ", btnCustomize:"ಕಸ್ಟಮೈಸ್ ಮಾಡಿ", btnAccept:"ಎಲ್ಲವನ್ನೂ ಸ್ವೀಕರಿಸಿ",
      modalTitle:"ಗೌಪ್ಯತಾ ಆದ್ಯತೆಗಳು",
      btnOptOutAll:"ಅನಗತ್ಯ ನಿಲ್ಲಿಸಿ", btnRestore:"ಡಿಫಾಲ್ಟ್ ಮರುಸ್ಥಾಪಿಸಿ", btnSave:"ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ",
      settingsBtn:"⚙️ ಗೌಪ್ಯತಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು", toastSaved:"ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ",
      regionBadgeGDPR:"ಪತ್ತೆಯಾದ ಪ್ರದೇಶ: EU (GDPR)", regionBadgeDPDP:"ಪತ್ತೆಯಾದ ಪ್ರದೇಶ: ಭಾರತ (DPDP)",
      dpdpNote:"DPDP ಕಾಯ್ದೆ ಪ್ರಕಾರ ಒಪ್ಪಿಗೆ ಸ್ಪಷ್ಟ ಮತ್ತು ಸಮಯ-ಸೀಮಿತವಾಗಿರಬೇಕು.",
      rightsNote:"ನಿಮ್ಮ ಹಕ್ಕುಗಳು:", rightsNoteBody:"ಗೌಪ್ಯತಾ ಘಟನೆ ಸಂದರ್ಭದಲ್ಲಿ", rightsNoteBody2:"ನಿಯಮಗಳ ಪ್ರಕಾರ ತಿಳಿಸಲಾಗುವುದು.",
      rightsTitle:"🛡️ ನಿಮ್ಮ ಡೇಟಾ ಹಕ್ಕುಗಳು", rightsIntro:"DPDP ಮತ್ತು GDPR ಅಡಿಯಲ್ಲಿ ನಿಮಗೆ ಹಕ್ಕುಗಳಿವೆ:",
      rightsAccess:"📄 ಪ್ರವೇಶ: ಡೇಟಾ ಪ್ರತಿ ಕೋರಿ.", rightsRectification:"✏️ ತಿದ್ದುಪಡಿ: ತಪ್ಪಾದ ಡೇಟಾ ಸರಿಪಡಿಸಿ.",
      rightsErasure:"🗑️ ಅಳಿಸುವಿಕೆ: ಡೇಟಾ ತೆಗೆದುಹಾಕಲು ಕೋರಿ.", rightsRestriction:"⛔ ನಿರ್ಬಂಧ: ಡೇಟಾ ಬಳಕೆ ಮಿತಿಗೊಳಿಸಿ.",
      rightsObjection:"🚫 ಆಕ್ಷೇಪಣೆ: ಮಾರ್ಕೆಟಿಂಗ್‌ನಿಂದ ಹೊರಗೆ.", rightsPortability:"🔄 ಪೋರ್ಟಬಿಲಿಟಿ: ಡೇಟಾ ರಫ್ತು ಮಾಡಿ.",
      rightsWithdraw:"🔓 ಒಪ್ಪಿಗೆ ಹಿಂಪಡೆಯಿರಿ.", rightsContact:"ಹಕ್ಕುಗಳಿಗಾಗಿ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      rightsClose:"ಮುಚ್ಚಿ",
      riskTitle:"ಗೌಪ್ಯತಾ ಅಪಾಯ", riskLow:"ಕಡಿಮೆ ಅಪಾಯ", riskMedium:"ಮಧ್ಯಮ ಅಪಾಯ", riskHigh:"ಹೆಚ್ಚಿನ ಅಪಾಯ",
      riskKeyFactors:"ಪ್ರಮುಖ ಅಂಶಗಳು:", riskOnlyNecessary:"ಅಗತ್ಯ ಪ್ರಕ್ರಿಯೆಗಳು ಮಾತ್ರ.",
      riskDefaultRec:"ಕನಿಷ್ಠ ಡೇಟಾ ಬಳಸುತ್ತಿವೆ.",
      riskFactorAnalytics:"ವಿಶ್ಲೇಷಣೆ ಸಕ್ರಿಯ", riskFactorMarketing:"ಮಾರ್ಕೆಟಿಂಗ್ ಸಕ್ರಿಯ",
      riskFactorPersonalization:"ವೈಯಕ್ತಿಕಗೊಳಿಸುವಿಕೆ ಸಕ್ರಿಯ", riskFactorThirdParty:"ಮೂರನೇ ಪಕ್ಷ ಹಂಚಿಕೆ",
      riskRecHighDPDPThird:"DPDP: ಮೂರನೇ ಪಕ್ಷ ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ.", riskRecHighGDPRThird:"GDPR: ಮೂರನೇ ಪಕ್ಷ ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ.",
      riskRecHighMarketing:"ಮಾರ್ಕೆಟಿಂಗ್ ಕುಕೀಗಳನ್ನು ನಿಲ್ಲಿಸಿ.", riskRecMedium:"ಮಾರ್ಕೆಟಿಂಗ್ ಮಿತಿಗೊಳಿಸಿ.",
      riskRecLowDPDP:"ಕಡಿಮೆ ಅಪಾಯ — DPDP ಇಣಿಕೆ.", riskRecLowGDPR:"ಕಡಿಮೆ ಅಪಾಯ — GDPR ಇಣಿಕೆ.",
      vendorModalTitle:"ಮಾರಾಟಗಾರರು ಮತ್ತು ಡೇಟಾ ಹಂಚಿಕೆ", vendorPurposeLabel:"ಉದ್ದೇಶ:", vendorDataLabel:"ಹಂಚಿದ ಡೇಟಾ:",
      vendorNotSpecified:"ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ", vendorNone:"ಬಾಹ್ಯ ಮಾರಾಟಗಾರರು ಇಲ್ಲ.", vendorError:"ಮಾರಾಟಗಾರ ಡೇಟಾ ಲೋಡ್ ಆಗಲಿಲ್ಲ.",
      vendorClose:"ಮುಚ್ಚಿ", viewVendorsBtn:"ಮಾರಾಟಗಾರರು ನೋಡಿ →", viewRightsBtn:"ಹಕ್ಕುಗಳನ್ನು ನೋಡಿ →",
      consentDurationLabel:"ಒಪ್ಪಿಗೆ ಅವಧಿ", duration24h:"24 ಗಂಟೆಗಳು", duration30d:"1 ತಿಂಗಳು", duration365d:"1 ವರ್ಷ",
      purposeLabels:{ necessary:"ಅಗತ್ಯ", analytics:"ವಿಶ್ಲೇಷಣೆ", marketing:"ಮಾರ್ಕೆಟಿಂಗ್", personalization:"ವೈಯಕ್ತಿಕಗೊಳಿಸುವಿಕೆ", third_party_sharing:"ಮೂರನೇ ಪಕ್ಷ" },
      purposeDescs:{ necessary:"ಭದ್ರತೆ ಮತ್ತು ಮುಖ್ಯ ಕಾರ್ಯಚಟುವಟಿಕೆಗೆ ಅಗತ್ಯ.", analytics:"ವೆಬ್‌ಸೈಟ್ ಬಳಕೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು.", marketing:"ಸಂಬಂಧಿತ ಜಾಹೀರಾತುಗಳು.", personalization:"ಭಾಷೆ ಆದ್ಯತೆಗಳು.", third_party_sharing:"ವಿಶ್ವಾಸಾರ್ಹ ಪಾಲುದಾರರೊಂದಿಗೆ ಸೀಮಿತ ಡೇಟಾ." },
      poweredBy:"ENCRYPT CMP ಮೂಲಕ · CSIC 1.0",
    },
    ml:{
  bannerTitle:"🔒 ENCRYPT CMP",
  bannerText:"അത്യാവശ്യ പ്രവർത്തനം, വിശകലനം, മാർക്കറ്റിംഗ്, വ്യക്തിഗതമാക്കൽ, മൂന്നാം കക്ഷി സേവനങ്ങൾക്കായി ഞങ്ങൾ കുക്കികൾ ഉപയോഗിക്കുന്നു.",
  btnReject:"ഞാൻ സമ്മതിക്കുന്നില്ല", btnCustomize:"ക്രമീകരിക്കുക", btnAccept:"എല്ലാം സ്വീകരിക്കുക",
  modalTitle:"സ്വകാര്യതാ മുൻഗണനകൾ",
  btnOptOutAll:"അനാവശ്യം ഒഴിവാക്കുക", btnRestore:"ഡിഫോൾട്ട് പുനഃസ്ഥാപിക്കുക", btnSave:"മുൻഗണനകൾ സംരക്ഷിക്കുക",
  settingsBtn:"⚙️ സ്വകാര്യതാ ക്രമീകരണങ്ങൾ", toastSaved:"മുൻഗണനകൾ സംരക്ഷിച്ചു",
  regionBadgeGDPR:"കണ്ടെത്തിയ മേഖല: EU (GDPR)", regionBadgeDPDP:"കണ്ടെത്തിയ മേഖല: ഇന്ത്യ (DPDP)",
  dpdpNote:"ഇന്ത്യയുടെ DPDP നിയമം അനുസരിച്ച് സമ്മതം വ്യക്തവും സമയബദ്ധവുമായിരിക്കണം.",
  rightsNote:"നിങ്ങളുടെ അവകാശങ്ങൾ:", rightsNoteBody:"സ്വകാര്യതാ സംഭവമുണ്ടായാൽ", rightsNoteBody2:"നിയമങ്ങൾ അനുസരിച്ച് അറിയിക്കും.",
  rightsTitle:"🛡️ നിങ്ങളുടെ ഡേറ്റ അവകാശങ്ങൾ", rightsIntro:"DPDP, GDPR പ്രകാരം നിങ്ങൾക്ക് അവകാശങ്ങളുണ്ട്:",
  rightsAccess:"📄 ആക്സസ്: ഡേറ്റയുടെ പകർപ്പ് അഭ്യർത്ഥിക്കുക.",
  rightsRectification:"✏️ തിരുത്തൽ: തെറ്റായ ഡേറ്റ ശരിയാക്കുക.",
  rightsErasure:"🗑️ മായ്ക്കൽ: ഡേറ്റ നീക്കം ചെയ്യാൻ അഭ്യർത്ഥിക്കുക.",
  rightsRestriction:"⛔ നിയന്ത്രണം: ഡേറ്റ ഉപയോഗം പരിമിതപ്പെടുത്തുക.",
  rightsObjection:"🚫 എതിർപ്പ്: മാർക്കറ്റിംഗിൽ നിന്ന് പിന്മാറുക.",
  rightsPortability:"🔄 പോർട്ടബിലിറ്റി: ഡേറ്റ കയറ്റുമതി ചെയ്യുക.",
  rightsWithdraw:"🔓 സമ്മതം പിൻവലിക്കുക.",
  rightsContact:"ഈ അവകാശങ്ങൾ ഉപയോഗിക്കാൻ ഡേറ്റ പ്രൊട്ടക്ഷൻ ഓഫീസറെ ബന്ധപ്പെടുക.",
  rightsClose:"അടയ്ക്കുക",
  riskTitle:"സ്വകാര്യതാ റിസ്ക്", riskLow:"കുറഞ്ഞ റിസ്ക്", riskMedium:"മധ്യ റിസ്ക്", riskHigh:"ഉയർന്ന റിസ്ക്",
  riskKeyFactors:"പ്രധാന ഘടകങ്ങൾ:", riskOnlyNecessary:"അത്യാവശ്യ പ്രക്രിയകൾ മാത്രം.",
  riskDefaultRec:"നിലവിലെ ക്രമീകരണങ്ങൾ കുറഞ്ഞ ഡേറ്റ ഉപയോഗിക്കുന്നു.",
  riskFactorAnalytics:"വിശകലനം സജീവം", riskFactorMarketing:"മാർക്കറ്റിംഗ് സജീവം",
  riskFactorPersonalization:"വ്യക്തിഗതമാക്കൽ സജീവം", riskFactorThirdParty:"മൂന്നാം കക്ഷി പങ്കിടൽ",
  riskRecHighDPDPThird:"DPDP: മൂന്നാം കക്ഷി പങ്കിടൽ നിർത്തുക.",
  riskRecHighGDPRThird:"GDPR: മൂന്നാം കക്ഷി പങ്കിടൽ നിർത്തുക.",
  riskRecHighMarketing:"മാർക്കറ്റിംഗ് കുക്കികൾ നിർത്തുക.",
  riskRecMedium:"മാർക്കറ്റിംഗ് പരിമിതപ്പെടുത്തുക.",
  riskRecLowDPDP:"കുറഞ്ഞ റിസ്ക് — DPDP അനുസൃതം.",
  riskRecLowGDPR:"കുറഞ്ഞ റിസ്ക് — GDPR അനുസൃതം.",
  vendorModalTitle:"വെണ്ടർമാരും ഡേറ്റ പങ്കിടലും",
  vendorPurposeLabel:"ഉദ്ദേശ്യം:", vendorDataLabel:"പങ്കിട്ട ഡേറ്റ:",
  vendorNotSpecified:"വ്യക്തമാക്കിയിട്ടില്ല", vendorNone:"ബാഹ്യ വെണ്ടർമാർ ഇല്ല.",
  vendorError:"വെണ്ടർ ഡേറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",
  vendorClose:"അടയ്ക്കുക", viewVendorsBtn:"വെണ്ടർമാർ കാണുക →", viewRightsBtn:"അവകാശങ്ങൾ കാണുക →",
  consentDurationLabel:"സമ്മത കാലാവധി",
  duration24h:"24 മണിക്കൂർ", duration30d:"1 മാസം", duration365d:"1 വർഷം",
  purposeLabels:{ necessary:"അത്യാവശ്യം", analytics:"വിശകലനം", marketing:"മാർക്കറ്റിംഗ്", personalization:"വ്യക്തിഗതമാക്കൽ", third_party_sharing:"മൂന്നാം കക്ഷി" },
  purposeDescs:{ necessary:"സുരക്ഷയ്ക്കും പ്രധാന പ്രവർത്തനത്തിനും ആവശ്യം.", analytics:"വെബ്സൈറ്റ് ഉപയോഗം മനസ്സിലാക്കാൻ.", marketing:"പ്രസക്തമായ പരസ്യങ്ങൾ.", personalization:"ഭാഷാ മുൻഗണനകൾ ഓർക്കാൻ.", third_party_sharing:"വിശ്വസ്ത പങ്കാളികളുമായി പരിമിത ഡേറ്റ." },
  poweredBy:"ENCRYPT CMP വഴി · CSIC 1.0",
},
  };

  const t = () => TR[lang] || TR.en;

  // ── STYLES ────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (d.getElementById("_ecmp_css")) return;
    const s = d.createElement("style");
    s.id = "_ecmp_css";
    s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
#_ecmp_root,#_ecmp_root *{box-sizing:border-box;font-family:'Poppins',sans-serif;}
#_ecmp_banner{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);width:92%;max-width:540px;
  background:rgba(255,255,255,0.88);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.5);
  border-radius:22px;box-shadow:0 16px 48px rgba(90,66,149,0.18);padding:28px;
  z-index:2147483640;display:none;animation:_ecmpFU 0.45s ease forwards;}
@keyframes _ecmpFU{from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
#_ecmp_banner._ecmp_show{display:block;}
._ecmp_lang_bar{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
._ecmp_lb{padding:4px 9px;border-radius:10px;border:1px solid rgba(90,66,149,0.2);cursor:pointer;
  font-size:11px;font-weight:500;background:rgba(255,255,255,0.9);color:#5a4295;transition:all .15s;}
._ecmp_lb:hover{background:rgba(232,222,252,0.9);}
._ecmp_lb._ecmp_la{background:#5a4295;color:white;border-color:#5a4295;}
._ecmp_rbadge{display:inline-block;font-size:11px;font-weight:600;color:#5a4295;
  background:rgba(90,66,149,0.10);padding:4px 10px;border-radius:10px;margin-bottom:10px;border:1px solid rgba(90,66,149,0.15);}
._ecmp_title{font-size:18px;font-weight:700;color:#2d2352;margin-bottom:8px;}
._ecmp_body{font-size:13px;color:#5a5a7a;line-height:1.6;margin-bottom:16px;}
._ecmp_dpdp{font-size:11px;color:#92400e;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);
  border-radius:8px;padding:6px 10px;margin-bottom:12px;display:none;}
._ecmp_btns{display:flex;gap:10px;flex-wrap:wrap;}
._ecmp_btn{flex:1;padding:12px 10px;border-radius:14px;border:none;cursor:pointer;
  font-size:13px;font-weight:600;transition:all .18s;font-family:'Poppins',sans-serif;min-width:80px;}
._ecmp_acc{background:#3aab8a;color:white;box-shadow:0 4px 14px rgba(58,171,138,0.3);}
._ecmp_acc:hover{background:#2d9b7d;transform:translateY(-1px);}
._ecmp_rej{background:rgba(200,24,106,0.08);color:#9d1261;border:1px solid rgba(200,24,106,0.2);}
._ecmp_cus{background:rgba(90,66,149,0.10);color:#5a4295;border:1px solid rgba(90,66,149,0.2);}
._ecmp_pw{font-size:10px;color:#b0a8c8;margin-top:10px;text-align:center;}
#_ecmp_modal{position:fixed;inset:0;background:rgba(45,35,82,0.35);backdrop-filter:blur(6px);
  z-index:2147483645;display:none;justify-content:center;align-items:center;padding:20px;overflow:auto;}
#_ecmp_modal._ecmp_show{display:flex;}
._ecmp_mbox{background:rgba(255,255,255,0.95);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.6);
  border-radius:24px;padding:28px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;
  box-shadow:0 24px 80px rgba(90,66,149,0.22);animation:_ecmpFU .35s ease;}
._ecmp_mtitle{font-size:20px;font-weight:700;color:#2d2352;margin-bottom:18px;}
._ecmp_pc{padding:14px 16px;border-radius:14px;margin-bottom:10px;border:1px solid rgba(90,66,149,0.12);
  background:rgba(245,242,255,0.5);transition:border-color .2s;}
._ecmp_pc:hover{border-color:rgba(90,66,149,0.25);}
._ecmp_ph{display:flex;justify-content:space-between;align-items:center;}
._ecmp_pn{font-size:14px;font-weight:600;color:#2d2352;}
._ecmp_pd{margin-top:5px;font-size:12px;color:#6b6b8f;line-height:1.5;}
._ecmp_tgl{position:relative;width:48px;height:26px;flex-shrink:0;}
._ecmp_tgl input{opacity:0;width:0;height:0;}
._ecmp_sl{position:absolute;cursor:pointer;inset:0;background:#d1d5db;border-radius:26px;transition:.3s;}
._ecmp_sl:before{content:"";position:absolute;height:20px;width:20px;left:3px;bottom:3px;
  background:white;border-radius:50%;transition:.3s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
._ecmp_tgl input:checked+._ecmp_sl{background:#3aab8a;}
._ecmp_tgl input:checked+._ecmp_sl:before{transform:translateX(22px);}
._ecmp_tgl input:disabled+._ecmp_sl{opacity:0.5;cursor:not-allowed;}
._ecmp_rin{margin-top:18px;font-size:12px;color:#555;line-height:1.6;
  background:rgba(90,66,149,0.05);border-radius:10px;padding:12px 14px;border:1px solid rgba(90,66,149,0.1);}
._ecmp_rights{display:none;margin-top:14px;}
._ecmp_rbox{background:rgba(245,242,255,0.7);border:1px solid rgba(90,66,149,0.15);border-radius:16px;padding:20px;}
._ecmp_rbox h3{color:#5a4295;font-size:18px;margin-bottom:12px;}
._ecmp_rbox p{font-size:13px;color:#444;line-height:1.7;}
._ecmp_rbox ul{margin-top:10px;padding-left:16px;font-size:13px;color:#444;line-height:1.9;}
._ecmp_risk{margin-top:14px;padding:14px;background:rgba(255,255,255,0.7);border-radius:14px;
  border:1px solid rgba(90,66,149,0.1);}
._ecmp_riskrow{display:flex;justify-content:space-between;align-items:center;}
._ecmp_riskbar{margin-top:6px;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;}
._ecmp_riskfill{height:8px;background:#22c55e;border-radius:999px;transition:all .4s ease;}
._ecmp_risklbl{margin-top:4px;font-size:12px;font-weight:600;}
._ecmp_riskfactors{margin-top:8px;padding-left:14px;font-size:11px;color:#555;}
._ecmp_riskrec{margin-top:6px;font-size:11px;font-style:italic;color:#6b6b8f;}
._ecmp_ctrl{margin-top:14px;padding:14px;background:rgba(255,255,255,0.6);border-radius:14px;border:1px solid rgba(90,66,149,0.1);}
._ecmp_dur label{font-size:13px;font-weight:600;color:#5a4295;display:block;margin-bottom:6px;}
._ecmp_dur select{width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(90,66,149,0.2);
  font-size:13px;font-family:'Poppins',sans-serif;background:white;color:#2d2352;}
._ecmp_vlink,._ecmp_rlink{background:none;border:none;color:#5a4295;font-size:12px;cursor:pointer;
  text-decoration:underline;padding:0;font-family:'Poppins',sans-serif;margin-top:8px;display:block;}
._ecmp_mact{margin-top:16px;display:flex;flex-direction:column;gap:8px;}
._ecmp_sv{background:#5a4295;color:white;padding:13px;border-radius:14px;border:none;cursor:pointer;
  font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;transition:all .18s;}
._ecmp_sv:hover{background:#4a3280;}
._ecmp_oo{background:rgba(200,24,106,0.08);color:#9d1261;padding:11px;border-radius:14px;
  border:1px solid rgba(200,24,106,0.2);cursor:pointer;font-size:13px;font-weight:500;font-family:'Poppins',sans-serif;}
._ecmp_rs{background:rgba(90,66,149,0.08);color:#5a4295;padding:11px;border-radius:14px;
  border:1px solid rgba(90,66,149,0.15);cursor:pointer;font-size:13px;font-weight:500;font-family:'Poppins',sans-serif;}
#_ecmp_vmodal{position:fixed;inset:0;background:rgba(45,35,82,0.35);backdrop-filter:blur(6px);
  z-index:2147483646;display:none;justify-content:center;align-items:center;padding:20px;}
#_ecmp_vmodal._ecmp_show{display:flex;}
._ecmp_vmbox{background:rgba(255,255,255,0.96);border-radius:22px;padding:24px;width:100%;max-width:520px;
  max-height:80vh;overflow-y:auto;box-shadow:0 24px 80px rgba(90,66,149,0.22);}
._ecmp_vmbox h3{color:#5a4295;font-size:18px;margin-bottom:16px;}
#_ecmp_toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
  background:#5a4295;color:white;padding:11px 22px;border-radius:14px;font-size:13px;font-weight:500;
  display:none;z-index:2147483647;box-shadow:0 8px 24px rgba(90,66,149,0.3);font-family:'Poppins',sans-serif;}
#_ecmp_gear{position:fixed;right:20px;bottom:20px;width:42px;height:42px;border-radius:50%;
  background:#5a4295;color:white;border:none;cursor:pointer;font-size:18px;
  display:none;z-index:2147483638;box-shadow:0 4px 16px rgba(90,66,149,0.4);
  transition:all .2s;align-items:center;justify-content:center;}
#_ecmp_gear:hover{transform:scale(1.1);}
#_ecmp_gear._ecmp_show{display:flex;}
    `;
    d.head.appendChild(s);
  }

  // ── BUILD HTML ────────────────────────────────────────────────────────────
  function buildUI() {
    const root = d.createElement("div");
    root.id = "_ecmp_root";
    root.innerHTML = `
      <div id="_ecmp_banner">
        <div class="_ecmp_lang_bar" id="_ecmp_blang"></div>
        <div class="_ecmp_rbadge" id="_ecmp_rbadge"></div>
        <div class="_ecmp_title" id="_ecmp_btitle"></div>
        <div class="_ecmp_body" id="_ecmp_bbody"></div>
        <div class="_ecmp_dpdp" id="_ecmp_dpdp"></div>
        <div class="_ecmp_btns">
          <button class="_ecmp_btn _ecmp_rej" id="_ecmp_br"></button>
          <button class="_ecmp_btn _ecmp_cus" id="_ecmp_bc"></button>
          <button class="_ecmp_btn _ecmp_acc" id="_ecmp_ba"></button>
        </div>
        <div class="_ecmp_pw" id="_ecmp_pw"></div>
      </div>

      <div id="_ecmp_modal">
        <div class="_ecmp_mbox">
          <div class="_ecmp_lang_bar" id="_ecmp_mlang"></div>
          <div class="_ecmp_mtitle" id="_ecmp_mtitle"></div>
          <div id="_ecmp_purposes"></div>

          <div class="_ecmp_rin" id="_ecmp_rin"></div>

          <div class="_ecmp_rights" id="_ecmp_rights">
            <div class="_ecmp_rbox">
              <h3 id="_ecmp_rtitle"></h3>
              <p id="_ecmp_rintro"></p>
              <ul id="_ecmp_rlist"></ul>
              <p id="_ecmp_rcontact" style="margin-top:12px;font-size:12px;opacity:.8;"></p>
              <button class="_ecmp_rs" id="_ecmp_rclose" style="margin-top:12px;max-width:120px;"></button>
            </div>
          </div>

          <div class="_ecmp_risk" id="_ecmp_risk">
            <div class="_ecmp_riskrow">
              <span id="_ecmp_risktitle" style="font-weight:600;font-size:13px;"></span>
              <span id="_ecmp_riskscore" style="font-size:11px;opacity:.7;"></span>
            </div>
            <div class="_ecmp_riskbar"><div class="_ecmp_riskfill" id="_ecmp_riskfill"></div></div>
            <div class="_ecmp_risklbl" id="_ecmp_risklbl"></div>
            <div id="_ecmp_riskfactors_wrap" style="margin-top:6px;">
              <div id="_ecmp_riskfklbl" style="font-size:11px;font-weight:600;margin-bottom:3px;"></div>
              <ul class="_ecmp_riskfactors" id="_ecmp_riskfactors"></ul>
            </div>
            <div class="_ecmp_riskrec" id="_ecmp_riskrec"></div>
          </div>

          <div class="_ecmp_ctrl">
            <button class="_ecmp_vlink" id="_ecmp_vlink"></button>
            <button class="_ecmp_rlink" id="_ecmp_rlink"></button>
            <div class="_ecmp_dur" style="margin-top:12px;">
              <label id="_ecmp_durlbl"></label>
              <select id="_ecmp_dur">
                <option value="24h"></option>
                <option value="30d" selected></option>
                <option value="365d"></option>
              </select>
            </div>
          </div>

          <div class="_ecmp_mact">
            <button class="_ecmp_sv" id="_ecmp_sv"></button>
            <button class="_ecmp_oo" id="_ecmp_oo"></button>
            <button class="_ecmp_rs" id="_ecmp_rs"></button>
          </div>
        </div>
      </div>

      <div id="_ecmp_vmodal">
        <div class="_ecmp_vmbox">
          <h3 id="_ecmp_vmtitle"></h3>
          <div id="_ecmp_vlist" style="font-size:13px;color:#444;line-height:1.6;"></div>
          <button class="_ecmp_rs" id="_ecmp_vmclose" style="margin-top:16px;max-width:120px;"></button>
        </div>
      </div>

      <div id="_ecmp_toast"></div>
      <button id="_ecmp_gear">⚙</button>
    `;
    d.body.appendChild(root);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  function renderLangBar(id) {
    const el = d.getElementById(id);
    if (!el) return;
    const labels = {en:"EN",hi:"हि",te:"తె",ta:"த",kn:"ಕ",ml:"മ"};
    el.innerHTML = Object.entries(labels).map(([l,lbl]) =>
      `<button class="_ecmp_lb ${l===lang?"_ecmp_la":""}" onclick="window._ecmpLang('${l}')">${lbl}</button>`
    ).join("");
  }

  function renderBanner() {
    const tr = t();
    d.getElementById("_ecmp_btitle").textContent = tr.bannerTitle;
    d.getElementById("_ecmp_bbody").textContent  = tr.bannerText;
    d.getElementById("_ecmp_br").textContent     = tr.btnReject;
    d.getElementById("_ecmp_bc").textContent     = tr.btnCustomize;
    d.getElementById("_ecmp_ba").textContent     = tr.btnAccept;
    d.getElementById("_ecmp_pw").textContent     = tr.poweredBy;
    d.getElementById("_ecmp_dpdp").textContent   = tr.dpdpNote;
    d.getElementById("_ecmp_dpdp").style.display = model==="dpdp"?"block":"none";
    d.getElementById("_ecmp_rbadge").textContent = model==="dpdp"?tr.regionBadgeDPDP:tr.regionBadgeGDPR;
    renderLangBar("_ecmp_blang");
  }

  function renderModal() {
    const tr = t();
    d.getElementById("_ecmp_mtitle").textContent = tr.modalTitle;
    d.getElementById("_ecmp_sv").textContent = tr.btnSave;
    d.getElementById("_ecmp_oo").textContent = tr.btnOptOutAll;
    d.getElementById("_ecmp_rs").textContent = tr.btnRestore;
    d.getElementById("_ecmp_vlink").textContent = tr.viewVendorsBtn;
    d.getElementById("_ecmp_rlink").textContent = tr.viewRightsBtn;
    d.getElementById("_ecmp_durlbl").textContent = tr.consentDurationLabel;
    const sel = d.getElementById("_ecmp_dur");
    sel.options[0].textContent = tr.duration24h;
    sel.options[1].textContent = tr.duration30d;
    sel.options[2].textContent = tr.duration365d;
    renderLangBar("_ecmp_mlang");
    renderPurposes();
    renderRightsNote();
    renderRights();
    updateRisk();
  }

  function renderPurposes() {
    const tr = t();
    const c = d.getElementById("_ecmp_purposes");
    c.innerHTML = "";
    ["necessary","analytics","marketing","personalization","third_party_sharing"].forEach(id => {
      const lbl  = tr.purposeLabels[id];
      const desc = tr.purposeDescs[id];
      const chk  = ps[id]?"checked":"";
      const dis  = id==="necessary"?"disabled":"";
      const el   = d.createElement("div");
      el.className = "_ecmp_pc";
      el.innerHTML = `
        <div class="_ecmp_ph">
          <div class="_ecmp_pn">${lbl}</div>
          <label class="_ecmp_tgl">
            <input type="checkbox" id="_ecmp_${id}" ${chk} ${dis}>
            <span class="_ecmp_sl"></span>
          </label>
        </div>
        <div class="_ecmp_pd">${desc}</div>`;
      c.appendChild(el);
      if (!dis) {
        d.getElementById(`_ecmp_${id}`).addEventListener("change", e => {
          ps[id] = e.target.checked;
          updateRisk();
        });
      }
    });
  }

  function renderRightsNote() {
    const tr = t();
    d.getElementById("_ecmp_rin").innerHTML =
      `<strong>${tr.rightsNote}</strong> ${tr.rightsNoteBody} ` +
      `<span style="color:#5a4295;">DPDP Act</span> & ` +
      `<span style="color:#5a4295;">GDPR</span> ${tr.rightsNoteBody2}`;
  }

  function renderRights() {
    const tr = t();
    d.getElementById("_ecmp_rtitle").textContent   = tr.rightsTitle;
    d.getElementById("_ecmp_rintro").textContent   = tr.rightsIntro;
    d.getElementById("_ecmp_rcontact").textContent = tr.rightsContact;
    d.getElementById("_ecmp_rclose").textContent   = tr.rightsClose;
    d.getElementById("_ecmp_rlist").innerHTML = [
      tr.rightsAccess, tr.rightsRectification, tr.rightsErasure,
      tr.rightsRestriction, tr.rightsObjection, tr.rightsPortability, tr.rightsWithdraw
    ].map(r => `<li>${r}</li>`).join("");
  }

  // ── RISK METER ────────────────────────────────────────────────────────────
  function updateRisk() {
    const tr = t();
    let score = 10; const factors = [];
    const isGDPR = model==="gdpr"; const isDPDP = model==="dpdp";
    if (ps.analytics)           { score += isGDPR?15:10; factors.push(tr.riskFactorAnalytics); }
    if (ps.marketing)           { score += isGDPR?25:20; factors.push(tr.riskFactorMarketing); }
    if (ps.personalization)     { score += isGDPR?15:20; factors.push(tr.riskFactorPersonalization); }
    if (ps.third_party_sharing) { score += isGDPR?30:35; factors.push(tr.riskFactorThirdParty); }
    score = Math.min(100, Math.max(0, score));

    let lbl, color, rec;
    if (score>=70)      { lbl=tr.riskHigh;   color="#ef4444"; rec=ps.third_party_sharing?(isDPDP?tr.riskRecHighDPDPThird:tr.riskRecHighGDPRThird):tr.riskRecHighMarketing; }
    else if (score>=40) { lbl=tr.riskMedium; color="#f59e0b"; rec=tr.riskRecMedium; }
    else                { lbl=tr.riskLow;    color="#22c55e"; rec=isDPDP?tr.riskRecLowDPDP:tr.riskRecLowGDPR; }

    d.getElementById("_ecmp_risktitle").textContent = tr.riskTitle;
    d.getElementById("_ecmp_riskscore").textContent = score+"/100";
    d.getElementById("_ecmp_riskfill").style.width  = Math.max(20,score)+"%";
    d.getElementById("_ecmp_riskfill").style.background = color;
    d.getElementById("_ecmp_risklbl").textContent   = lbl;
    d.getElementById("_ecmp_risklbl").style.color   = color;
    d.getElementById("_ecmp_riskfklbl").textContent = tr.riskKeyFactors;
    d.getElementById("_ecmp_riskrec").textContent   = rec || tr.riskDefaultRec;
    const fl = d.getElementById("_ecmp_riskfactors");
    fl.innerHTML = factors.length ? factors.map(f=>`<li>${f}</li>`).join("") : `<li>${tr.riskOnlyNecessary}</li>`;
  }

  // ── VENDOR MODAL ──────────────────────────────────────────────────────────
  async function loadVendors() {
    const tr = t();
    d.getElementById("_ecmp_vmtitle").textContent  = tr.vendorModalTitle;
    d.getElementById("_ecmp_vmclose").textContent  = tr.vendorClose;
    const vlist = d.getElementById("_ecmp_vlist");
    vlist.innerHTML = "<em>Loading…</em>";
    d.getElementById("_ecmp_vmodal").classList.add("_ecmp_show");
    if (!db) { vlist.textContent = tr.vendorError; return; }
    const { data, error } = await db.from("scripts_registry").select("name,purpose_id,data_elements").eq("enabled",true);
    if (error || !data || !data.length) { vlist.textContent = tr.vendorNone; return; }
    vlist.innerHTML = data.map(v => {
      const shared = Array.isArray(v.data_elements)&&v.data_elements.length?v.data_elements.join(", "):tr.vendorNotSpecified;
      return `<div style="margin-bottom:14px;padding:10px;background:rgba(90,66,149,0.05);border-radius:10px;">
        <strong style="color:#5a4295;">${v.name}</strong><br>
        <span>${tr.vendorPurposeLabel} ${v.purpose_id.replace(/_/g," ")}</span><br>
        <span>${tr.vendorDataLabel} ${shared}</span>
      </div>`;
    }).join("");
  }

  // ── SUPABASE ──────────────────────────────────────────────────────────────
  async function initDB() {
    // If already initialised, skip
    if (db) return;
    // If supabase already on page, use it directly
    if (w.supabase?.createClient) {
      db = w.supabase.createClient(CFG.sbUrl, CFG.sbKey);
      return;
    }
    // Load supabase from CDN
    await new Promise((res, rej) => {
      // Check if script already loading
      if (d.querySelector('script[src*="supabase-js"]')) {
        const check = setInterval(() => {
          if (w.supabase?.createClient) {
            clearInterval(check);
            db = w.supabase.createClient(CFG.sbUrl, CFG.sbKey);
            res();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); rej(new Error("Supabase load timeout")); }, 8000);
        return;
      }
      const s = d.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = () => {
        if (w.supabase?.createClient) {
          db = w.supabase.createClient(CFG.sbUrl, CFG.sbKey);
          res();
        } else {
          rej(new Error("Supabase loaded but createClient missing"));
        }
      };
      s.onerror = () => rej(new Error("Failed to load Supabase from CDN"));
      d.head.appendChild(s);
    });
  }

  async function persist(eventType) {
    const durVal = document.getElementById("_ecmp_dur")?.value || "30d";
    const exp = new Date();
    if (durVal === "24h") exp.setHours(exp.getHours() + 24);
    else if (durVal === "30d") exp.setDate(exp.getDate() + 30);
    else exp.setFullYear(exp.getFullYear() + 1);
     
    const rid = crypto.randomUUID();
    const now = new Date().toISOString();
    lastReceipt = { receipt_id:rid, device_id:deviceId, purposes:{...ps}, event_type:eventType, consent_model:model, lang, org:CFG.org, timestamp:now, expires_at:exp.toISOString() };

    // If db not ready yet, try initialising now
    if (!db) {
      try { await initDB(); } catch(e) { console.warn("[EncryptCMP] DB not available:", e.message); return rid; }
    }

    console.log("[EncryptCMP] Saving consent to Supabase:", eventType, deviceId);

    // Independent inserts — each wrapped so one failure cannot block the others
    try {
      const r1 = await db.from("consent_records").upsert(
        { device_id:deviceId, purposes:{...ps}, updated_at:now, expires_at:exp.toISOString(), consent_model:model },
        { onConflict:"device_id" }
      );
      if (r1.error) console.error("[EncryptCMP] consent_records error:", JSON.stringify(r1.error));
      else console.log("[EncryptCMP] consent_records \u2705");
    } catch(e) { console.error("[EncryptCMP] consent_records threw:", e.message); }

    try {
      const r2 = await db.from("consent_receipts").insert(
        { id:rid, subject_id:deviceId, purposes:{...ps}, expires_at:exp.toISOString(), consent_model:model, org:CFG.org, policy_version: CFG.policyVersion || "1.0.0" }
      );
      if (r2.error) console.error("[EncryptCMP] consent_receipts error:", JSON.stringify(r2.error));
      else console.log("[EncryptCMP] consent_receipts \u2705");
    } catch(e) { console.error("[EncryptCMP] consent_receipts threw:", e.message); }

    try {
      const r3 = await db.from("audit_logs").insert(
        { event_type:eventType, actor_id:deviceId, actor_role:"data_principal", details:{...lastReceipt} }
      );
      if (r3.error) console.error("[EncryptCMP] audit_logs error:", JSON.stringify(r3.error));
      else console.log("[EncryptCMP] audit_logs \u2705");
    } catch(e) { console.error("[EncryptCMP] audit_logs threw:", e.message); }

    return rid;
  }

  // ── REGION ────────────────────────────────────────────────────────────────
  async function detectRegion() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const r = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeout);
      const g = await r.json();
      const GDPR = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
        "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","NO","IS","LI","UK","GB"];
      if (g.country === "IN") model = "dpdp";
      else if (GDPR.includes(g.country)) model = "gdpr";
      else model = "dpdp";
    } catch {
      // Fallback: use browser timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        model = tz === "Asia/Kolkata" ? "dpdp" : 
                (tz && tz.startsWith("Europe/")) ? "gdpr" : "dpdp";
      } catch { model = "dpdp"; }
    }
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  function save(ls) { localStorage.setItem("_ecmp_ps",JSON.stringify(ps)); localStorage.setItem("_ecmp_ok","1"); }

  async function acceptAll() {
    ps={necessary:true,analytics:true,marketing:true,personalization:true,third_party_sharing:true};
    save(); hideBanner(); showGear(); toast(t().toastSaved);
    const rid=await persist("consent_accept_all"); dispatch("accept",{purposes:{...ps},receiptId:rid});
  }
  async function rejectAll() {
    ps={necessary:true,analytics:false,marketing:false,personalization:false,third_party_sharing:false};
    save(); hideBanner(); showGear(); toast(t().toastSaved);
    const rid=await persist("consent_reject_all"); dispatch("reject",{purposes:{...ps},receiptId:rid});
  }
  async function savePrefs() {
    save(); hideModal(); hideBanner(); showGear(); toast(t().toastSaved);
    const rid=await persist("consent_save_prefs"); dispatch("save",{purposes:{...ps},receiptId:rid});
  }
  function optOutAll() {
    ["analytics","marketing","personalization","third_party_sharing"].forEach(id=>{
      ps[id]=false; const el=d.getElementById(`_ecmp_${id}`); if(el)el.checked=false;
    }); updateRisk();
  }
  function restoreDefaults() {
    const def={necessary:true,analytics:true,marketing:false,personalization:true,third_party_sharing:false};
    Object.assign(ps,def);
    Object.keys(def).forEach(id=>{ const el=d.getElementById(`_ecmp_${id}`); if(el&&!el.disabled)el.checked=ps[id]; });
    updateRisk();
  }

  // ── UI HELPERS ────────────────────────────────────────────────────────────
  const $=id=>d.getElementById(id);
  const showBanner=()=>{ renderBanner(); $("_ecmp_banner").classList.add("_ecmp_show"); };
  const hideBanner=()=>  $("_ecmp_banner").classList.remove("_ecmp_show");
  const showModal =()=>{ renderModal(); $("_ecmp_modal").classList.add("_ecmp_show"); };
  const hideModal =()=>  $("_ecmp_modal").classList.remove("_ecmp_show");
  const showGear  =()=>  $("_ecmp_gear").classList.add("_ecmp_show");
  function toast(msg){ const el=$("_ecmp_toast"); el.textContent=msg; el.style.display="block"; clearTimeout(el._t); el._t=setTimeout(()=>el.style.display="none",2800); }
  function dispatch(ev,det){ w.dispatchEvent(new CustomEvent(`encrypt-cmp:${ev}`,{detail:det})); }

  // ── BIND ──────────────────────────────────────────────────────────────────
  function bindEvents() {
    $("_ecmp_ba").onclick = acceptAll;
    $("_ecmp_br").onclick = rejectAll;
    $("_ecmp_bc").onclick = ()=>{ hideBanner(); showModal(); };
    $("_ecmp_sv").onclick = savePrefs;
    $("_ecmp_oo").onclick = optOutAll;
    $("_ecmp_rs").onclick = restoreDefaults;
    $("_ecmp_gear").onclick = ()=>showModal();
    $("_ecmp_modal").onclick = e=>{ if(e.target.id==="_ecmp_modal") hideModal(); };
    $("_ecmp_vmodal").onclick = e=>{ if(e.target.id==="_ecmp_vmodal") $("_ecmp_vmodal").classList.remove("_ecmp_show"); };
    $("_ecmp_vlink").onclick = loadVendors;
    $("_ecmp_vmclose").onclick = ()=>$("_ecmp_vmodal").classList.remove("_ecmp_show");
    $("_ecmp_rlink").onclick = ()=>{ const r=$("_ecmp_rights"); r.style.display=r.style.display==="block"?"none":"block"; renderRights(); };
    $("_ecmp_rclose").onclick = ()=>$("_ecmp_rights").style.display="none";
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  w.EncryptCMP = {
    getConsent:    ()=>({...ps}),
    showBanner,
    getReceipt:    ()=>lastReceipt,
    setLang:       l=>{ if(TR[l]){lang=l; renderBanner(); if($("_ecmp_modal").classList.contains("_ecmp_show"))renderModal();} },
    isConsentGiven:()=>!!localStorage.getItem("_ecmp_ok"),
    revokeConsent: purpose=>{ if(purpose in ps&&purpose!=="necessary"){ps[purpose]=false; localStorage.setItem("_ecmp_ps",JSON.stringify(ps)); persist("consent_revoke_purpose"); dispatch("revoke",{purpose,purposes:{...ps}}); toast("Revoked: "+purpose);} },
    revokeAll:     ()=>{ ps={necessary:true,analytics:false,marketing:false,personalization:false,third_party_sharing:false}; localStorage.setItem("_ecmp_ps",JSON.stringify(ps)); localStorage.removeItem("_ecmp_ok"); persist("consent_revoke_all"); dispatch("revoke",{purpose:"all",purposes:{...ps}}); toast("All consents revoked"); },
  };
  w._ecmpLang = l => w.EncryptCMP.setLang(l);

  // ── INIT ──────────────────────────────────────────────────────────────────
  async function init() {
    injectStyles();
    buildUI();
    bindEvents();
    // Init DB FIRST so it's ready before user clicks any button
    try { await initDB(); console.log("[EncryptCMP] Supabase ready"); }
    catch(e) { console.warn("[EncryptCMP] DB init failed:", e.message); }
    await detectRegion();
    renderBanner();
    if (!localStorage.getItem("_ecmp_ok")) showBanner();
    else showGear();
    dispatch("ready",{deviceId,model,lang});
  }

  d.readyState==="loading" ? d.addEventListener("DOMContentLoaded",init) : init();

}(window, document));