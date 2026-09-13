import { Redirect } from 'expo-router';

// Backing route for the "Scan" tab button. The tab bar (see _layout.tsx)
// intercepts presses on this tab and pushes the capture stack screen
// directly, so this component is only ever reached via a direct/deep link —
// in which case it just forwards to the real capture flow.
export default function ScanTabStub() {
  return <Redirect href="/capture" />;
}
