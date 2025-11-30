export default function About() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">About Me</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Introduction</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                    Hello! I'm JH Kang, an AI Engineer based in South Korea. I'm passionate about machine learning, software engineering, and sharing my knowledge through this blog.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Experience</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>
                        <strong>AI Engineer</strong> at Company X (202X - Present)
                        <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">Working on large language models and computer vision projects.</p>
                    </li>
                    <li>
                        <strong>Software Developer</strong> at Company Y (201X - 202X)
                        <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">Developed web applications and backend services.</p>
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Feel free to reach out to me via email at <a href="mailto:gogo0920007@gmail.com" className="text-blue-600 hover:underline">gogo0920007@gmail.com</a>.
                </p>
            </section>
        </div>
    );
}
