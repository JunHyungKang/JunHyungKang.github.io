import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use',
    description: 'Terms of use for JunHyung’s Tech Log.',
};

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert prose-a:text-blue-400 hover:prose-a:text-blue-300">
                <h1>Terms of Use</h1>
                <p>Last updated: July 18, 2026</p>

                <p>
                    By using JunHyung’s Tech Log, you agree to these terms. If you do not agree, please stop using the site.
                </p>

                <h2>Purpose of the site</h2>
                <p>
                    This site shares technical notes, opinions, experiments, and project information for general educational purposes. It does not provide
                    professional legal, financial, medical, or security advice.
                </p>

                <h2>Accuracy and availability</h2>
                <p>
                    Technical information can become outdated and may contain mistakes. Examples may not work in every environment. Content and site features
                    are provided as available without a guarantee of accuracy, completeness, fitness for a particular purpose, or uninterrupted access.
                </p>

                <h2>Use of content</h2>
                <p>
                    Unless a page states otherwise, the original writing and site materials belong to the site operator. You may quote short portions with clear
                    attribution and a link to the original page. Republishing substantial portions, presenting the work as your own, or using it in a way that
                    violates applicable law is not permitted without prior permission.
                </p>

                <h2>External services and links</h2>
                <p>
                    The site links to third-party services and may use services such as GitHub, Giscus, and Google AdSense. Those services have their own terms
                    and policies. The site operator does not control or endorse all third-party content reached through external links.
                </p>

                <h2>Limitation of responsibility</h2>
                <p>
                    You are responsible for evaluating and testing information before relying on it. To the extent permitted by applicable law, the site operator
                    is not responsible for loss resulting from the use of the site or reliance on its content.
                </p>

                <h2>Changes and governing law</h2>
                <p>
                    These terms may be updated as the site changes. The laws of the Republic of Korea apply to these terms, without regard to conflict-of-law rules.
                </p>

                <h2>Contact</h2>
                <p>
                    Questions about these terms can be sent to <a href="mailto:gogo0920007@gmail.com">gogo0920007@gmail.com</a>.
                </p>
            </div>
        </main>
    );
}
