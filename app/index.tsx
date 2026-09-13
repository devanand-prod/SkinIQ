import { Redirect } from 'expo-router';

// Entry point for the root "/" route — SkinIQ always starts at onboarding.
// TODO: once scan history persistence is read on launch, skip onboarding
// (and go straight to the report tab) for a returning user with a saved scan.
export default function Index() {
  return <Redirect href="/welcome" />;
}
