import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { BreakingBar } from "@/components/layout/BreakingBar";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Clock, FileText, CheckCircle } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Grievance Redressal | Samparka",
  description:
    "Submit your complaints, corrections, or concerns to Samparka. We are committed to fair, transparent, and timely resolution of all grievances.",
};

export default function GrievancePage() {
  return (
    <>
      <TopBar />
      <Masthead />
      <BreakingBar />
      <NavBar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div className={styles.badge}>Grievance Redressal</div>
              <h1 className={styles.heroTitle}>We take every concern seriously</h1>
              <p className={styles.heroDesc}>
                Samparka is committed to accuracy, fairness, and editorial integrity. If you have a
                complaint about any published content, a correction request, or any other concern,
                this is the right place.
              </p>
            </div>
          </div>
        </section>

        {/* Process steps */}
        <section className={styles.processSection}>
          <div className="container">
            <div className={styles.processGrid}>
              <div className={styles.processCard}>
                <div className={styles.processIcon}>
                  <FileText size={20} />
                </div>
                <h3 className={styles.processTitle}>Submit</h3>
                <p className={styles.processDesc}>
                  Email us your complaint with a clear description of the issue and a link to the
                  relevant article if applicable.
                </p>
              </div>
              <div className={styles.processCard}>
                <div className={styles.processIcon}>
                  <Clock size={20} />
                </div>
                <h3 className={styles.processTitle}>Review</h3>
                <p className={styles.processDesc}>
                  Our editorial team reviews all grievances within 7 working days and contacts you
                  with an acknowledgement.
                </p>
              </div>
              <div className={styles.processCard}>
                <div className={styles.processIcon}>
                  <CheckCircle size={20} />
                </div>
                <h3 className={styles.processTitle}>Resolution</h3>
                <p className={styles.processDesc}>
                  Where warranted, corrections, clarifications, or takedowns are published promptly
                  and transparently.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content: policy + form */}
        <section className={styles.contentSection}>
          <div className="container">
            <div className={styles.contentGrid}>
              {/* Policy side */}
              <div className={styles.policyCol}>
                <h2 className={styles.sectionHeading}>Grievance policy</h2>

                <div className={styles.policyBlock}>
                  <h3 className={styles.policyHeading}>What we accept</h3>
                  <ul className={styles.policyList}>
                    <li>Factual inaccuracies in published articles</li>
                    <li>Requests for correction or clarification</li>
                    <li>Privacy and personal data concerns</li>
                    <li>Complaints about editorial conduct</li>
                    <li>Copyright or content ownership disputes</li>
                    <li>Reports of offensive or harmful content</li>
                  </ul>
                </div>

                <div className={styles.policyBlock}>
                  <h3 className={styles.policyHeading}>Response timelines</h3>
                  <ul className={styles.policyList}>
                    <li>
                      <strong>Acknowledgement:</strong> Within 3 working days
                    </li>
                    <li>
                      <strong>Initial review:</strong> Within 7 working days
                    </li>
                    <li>
                      <strong>Resolution:</strong> Within 30 days of submission
                    </li>
                  </ul>
                </div>

                <div className={styles.policyBlock}>
                  <h3 className={styles.policyHeading}>Grievance officer</h3>
                  <p className={styles.policyText}>
                    In accordance with the Information Technology (Intermediary Guidelines and
                    Digital Media Ethics Code) Rules, 2021, all grievances may be directed to our
                    designated Grievance Officer at:
                  </p>
                  <a
                    href="mailto:clawcode66@gmail.com"
                    className={styles.contactEmail}
                    id="grievance-email-link"
                  >
                    <Mail size={14} />
                    clawcode66@gmail.com
                  </a>
                  <p className={styles.policyText} style={{ marginTop: "8px" }}>
                    Please include <strong>«Grievance»</strong> in the subject line for faster
                    processing.
                  </p>
                </div>

                <div className={styles.policyBlock}>
                  <h3 className={styles.policyHeading}>Escalation</h3>
                  <p className={styles.policyText}>
                    If you are not satisfied with our response, you may escalate the matter to the
                    Press Council of India or approach appropriate regulatory authorities as provided
                    under applicable law.
                  </p>
                </div>
              </div>

              {/* Contact form side */}
              <div className={styles.formCol}>
                <div className={styles.formCard}>
                  <h2 className={styles.formHeading}>Submit a grievance</h2>
                  <p className={styles.formSubtitle}>
                    Fill out the form below or email us directly. All submissions are treated
                    confidentially.
                  </p>
                  <form
                    id="grievance-form"
                    action={`mailto:clawcode66@gmail.com?subject=Grievance%20Submission`}
                    method="get"
                    className={styles.form}
                  >
                    <div className={styles.fieldGroup}>
                      <label htmlFor="grievance-name" className={styles.label}>
                        Full name
                      </label>
                      <input
                        id="grievance-name"
                        name="name"
                        type="text"
                        className={styles.input}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="grievance-email" className={styles.label}>
                        Email address
                      </label>
                      <input
                        id="grievance-email"
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="grievance-type" className={styles.label}>
                        Type of grievance
                      </label>
                      <select
                        id="grievance-type"
                        name="type"
                        className={styles.select}
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="factual-error">Factual inaccuracy</option>
                        <option value="correction">Correction / clarification request</option>
                        <option value="privacy">Privacy concern</option>
                        <option value="editorial">Editorial conduct</option>
                        <option value="copyright">Copyright dispute</option>
                        <option value="harmful-content">Offensive or harmful content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="grievance-article" className={styles.label}>
                        Article link <span className={styles.optional}>(if applicable)</span>
                      </label>
                      <input
                        id="grievance-article"
                        name="article"
                        type="url"
                        className={styles.input}
                        placeholder="https://www.samparka.online/article?id=..."
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="grievance-message" className={styles.label}>
                        Description
                      </label>
                      <textarea
                        id="grievance-message"
                        name="body"
                        className={styles.textarea}
                        rows={5}
                        placeholder="Describe your grievance in detail. Please be as specific as possible."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      id="grievance-submit"
                      className={styles.submitBtn}
                    >
                      Submit via email
                    </button>

                    <p className={styles.formNote}>
                      Clicking submit will open your default email client pre-filled with your
                      submission.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
