import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy and cookie policy for JunHyung’s Tech Log.',
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert prose-a:text-blue-400 hover:prose-a:text-blue-300">
                <h1>Privacy Policy</h1>
                <p>Last updated: July 18, 2026</p>

                <p>
                    This policy explains how JunHyung’s Tech Log handles information when you visit
                    <a href="https://junhyungkang.github.io"> junhyungkang.github.io</a>. The site is a public technical blog operated by JH Kang.
                </p>

                <h2>Information handled by the site</h2>
                <p>
                    The blog does not require an account and does not directly collect names, passwords, or payment information. Like most hosted websites,
                    infrastructure providers may process technical data such as an IP address, browser type, referring page, requested URL, and request time
                    to deliver, secure, and maintain the service.
                </p>

                <h2>Google AdSense</h2>
                <p>
                    This site uses Google AdSense to verify the publisher account and, after approval, to provide advertising. Google and its partners may use
                    cookies, web beacons, IP addresses, and other identifiers to serve, personalize, and measure ads. Ad selection may be based on a visitor’s
                    previous visits to this and other websites where permitted.
                </p>
                <p>
                    You can learn how Google uses information from sites that use its services in
                    <a href="https://policies.google.com/technologies/partner-sites"> Google’s partner sites policy</a>. You can manage personalized advertising in
                    <a href="https://myadcenter.google.com/"> My Ad Center</a> and review Google advertising technologies in
                    <a href="https://policies.google.com/technologies/ads"> Google’s advertising policy</a>.
                </p>

                <h2>Comments through Giscus</h2>
                <p>
                    Article pages use Giscus for optional comments. Giscus loads content from GitHub Discussions. If you choose to sign in or comment,
                    GitHub and Giscus process the information needed for that interaction under their own policies. You can read the
                    <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"> GitHub Privacy Statement</a> and the
                    <a href="https://github.com/giscus/giscus/blob/main/PRIVACY-POLICY.md"> Giscus Privacy Policy</a>.
                </p>

                <h2>Cookies and consent</h2>
                <p>
                    Third-party services described above may store or read cookies and similar technologies. Where consent is legally required, advertising
                    is configured through Google’s certified consent tools. Browser settings can also be used to delete or block cookies, although doing so
                    may affect comments or advertising preferences.
                </p>

                <h2>External links</h2>
                <p>
                    Articles may link to external websites. Their privacy practices are controlled by their respective operators, not by this blog.
                </p>

                <h2>Changes and contact</h2>
                <p>
                    This policy may be updated when the site or its third-party services change. Questions about this policy can be sent to
                    <a href="mailto:gogo0920007@gmail.com"> gogo0920007@gmail.com</a>.
                </p>
            </div>
        </main>
    );
}
