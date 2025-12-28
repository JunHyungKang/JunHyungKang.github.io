import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for JunHyung\'s Tech Log',
};

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1>Terms of Service</h1>
                <p>Last updated: December 28, 2025</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using this website (https://junhyungkang.github.io), you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h2>2. Use License</h2>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on JunHyung's Tech Log's website for personal, non-commercial transitory viewing only.
                </p>
                <p>
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul>
                    <li>modify or copy the materials;</li>
                    <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                    <li>attempt to decompile or reverse engineer any software contained on JunHyung's Tech Log's website;</li>
                    <li>remove any copyright or other proprietary notations from the materials; or</li>
                    <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>

                <h2>3. Disclaimer</h2>
                <p>
                    The materials on JunHyung's Tech Log's website are provided on an 'as is' basis. JunHyung's Tech Log makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <h2>4. Limitations</h2>
                <p>
                    In no event shall JunHyung's Tech Log or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on JunHyung's Tech Log's website.
                </p>

                <h2>5. Revisions and Errata</h2>
                <p>
                    The materials appearing on JunHyung's Tech Log's website could include technical, typographical, or photographic errors. JunHyung's Tech Log does not warrant that any of the materials on its website are accurate, complete or current.
                </p>

                <h2>6. Links</h2>
                <p>
                    JunHyung's Tech Log has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by JunHyung's Tech Log of the site. Use of any such linked website is at the user's own risk.
                </p>

                <h2>7. Site Terms of Use Modifications</h2>
                <p>
                    JunHyung's Tech Log may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
                </p>

                <h2>8. Governing Law</h2>
                <p>
                    Any claim relating to JunHyung's Tech Log's website shall be governed by the laws of the Republic of Korea without regard to its conflict of law provisions.
                </p>
            </div>
        </main>
    );
}
