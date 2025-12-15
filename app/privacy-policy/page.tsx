import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for JunHyung\'s Tech Log',
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1>Privacy Policy</h1>
                <p>Last updated: December 15, 2025</p>

                <p>
                    At JunHyung's Tech Log, accessible from https://junhyungkang.github.io, one of our main priorities is the privacy of our visitors.
                    This Privacy Policy document contains types of information that is collected and recorded by JunHyung's Tech Log and how we use it.
                </p>

                <h2>Log Files</h2>
                <p>
                    JunHyung's Tech Log follows a standard procedure of using log files. These files log visitors when they visit websites.
                    All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses,
                    browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
                    These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends,
                    administering the site, tracking users' movement on the website, and gathering demographic information.
                </p>

                <h2>Cookies and Web Beacons</h2>
                <p>
                    Like any other website, JunHyung's Tech Log uses 'cookies'. These cookies are used to store information including visitors' preferences,
                    and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing
                    our web page content based on visitors' browser type and/or other information.
                </p>

                <h2>Google DoubleClick DART Cookie</h2>
                <p>
                    Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon
                    their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting
                    the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a>
                </p>

                <h2>Privacy Policies</h2>
                <p>
                    You may consult this list to find the Privacy Policy for each of the advertising partners of JunHyung's Tech Log.
                </p>
                <p>
                    Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements
                    and links that appear on JunHyung's Tech Log, which are sent directly to users' browser. They automatically receive your IP address when this occurs.
                    These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                </p>
                <p>
                    Note that JunHyung's Tech Log has no access to or control over these cookies that are used by third-party advertisers.
                </p>
            </div>
        </main>
    );
}
