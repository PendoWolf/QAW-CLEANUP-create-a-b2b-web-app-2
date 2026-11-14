import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

let visitorId = localStorage.getItem('demo-visitor-id');
let accountId = localStorage.getItem('demo-account-id');
const isNewVisitor = !visitorId;
const isNewAccount = !accountId;

if (!visitorId) {
  visitorId = 'visitor-' + Math.random().toString(36).slice(2);
  localStorage.setItem('demo-visitor-id', visitorId);
}
if (!accountId) {
  accountId = 'account-' + Math.random().toString(36).slice(2);
  localStorage.setItem('demo-account-id', accountId);
}

pendo.initialize({
  visitor: {
    id: visitorId,
  },
  account: {
    id: accountId,
  },
  sessionReplay: { isActive: true },
});

// Track Event: first visit only. The IDs stored in localStorage act as the
// persistent guard, so this fires once when they are created.
if (isNewVisitor || isNewAccount) {
  pendo.track('Visitor and account identified', {
    new_visitor: isNewVisitor,
    new_account: isNewAccount,
    session_replay_active: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
