import type { LegalDoc } from "../types";

// Verbatim reproduction of the old /cookies.htm.
// Light fixes: "Facbook" → "Facebook"; "the Action website" → "this website".
export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Cookies Information",
  description:
    "Information about the cookies used on the Berkshire Oncology Partnership website.",
  html: `
<p>Also known as browser cookies or tracking cookies, cookies are small, often encrypted text files, located in browser directories. They are used by web developers to help users navigate their websites efficiently and perform certain functions. Due to their core role of enhancing/enabling usability or site processes, disabling cookies may prevent users from using certain websites.</p>
<p>Cookies are created when a user's browser loads a particular website. The website sends information to the browser which then creates a text file. Every time the user goes back to the same website, the browser retrieves and sends this file to the website's server.</p>
<p>Computer Cookies are created not just by the website the user is browsing, but also by other websites that run ads, widgets, or other elements on the page being loaded. These cookies regulate how the ads appear or how the widgets and other elements function on the page.</p>
<p>When we provide services, we want to make them easy, useful and reliable. This sometimes involves placing cookies on your computer. These cookies cannot be used to identify you personally and are used to improve services for you, for example through:</p>
<ul>
<li>Letting you navigate between pages efficiently.</li>
<li>Enabling a service to recognise your computer so you don't have to give the same information during one task.</li>
<li>Recognising that you have already given a username and password so you don't need to enter it for every web page requested.</li>
<li>Measuring how many people are using services, so they can be made easier to use and that there is enough capacity to ensure they are fast.</li>
</ul>
<p>All About Cookies (www.allaboutcookies.org) is a free resource website to help users understand the issues surrounding the use of cookies.</p>
<p>Users typically have the opportunity to set their browser to accept all or some cookies, to notify them when a cookie is issued, or not to receive cookies at any time. The last of these options, of course, means that personalised services cannot be provided and the user may not be able to take full advantage of all of a website's features.</p>
<p>NB: The aboutcookies.org website has instructions for popular browsers on how you can delete and control the cookies that are stored on your computer.</p>
<p>The cookies we may use on this website have been categorised as follows:</p>

<h3>Category 1: strictly necessary cookies</h3>
<p>These cookies are essential in order to enable you to move around our sites and use their features, such as accessing secure areas of the website. Without these cookies services you have asked for, like shopping baskets or e-billing, cannot be provided. The list below shows the cookies that we use, other than those that are strictly necessary to this service.</p>

<h3>Category 2: performance cookies</h3>
<p>These cookies collect information about how visitors use a website, for instance which pages visitors go to most often, and if they get error messages from web pages. These cookies don't collect information that identifies a visitor. All information these cookies collect is aggregated and therefore anonymous. It is only used to improve how a website works.</p>

<h3>Social Media Cookies</h3>
<p>These cookies may be used by external social media websites, for example Facebook, YouTube, Twitter, Pinterest, and LinkedIn. Please refer to the social media websites' own cookies and privacy policies for more details.</p>

<h3>ga.js – Cookie Usage</h3>
<p>The ga.js JavaScript library uses first-party cookies to:</p>
<ul>
<li>Determine which domain to measure</li>
<li>Distinguish unique users</li>
<li>Remember the number and time of previous visits</li>
<li>Remember traffic source information</li>
<li>Determine the start and end of a session</li>
<li>Remember the value of visitor-level custom variables.</li>
</ul>
<p>By default, this library sets cookies on the domain specified in the document.host browser property and sets the cookie path to the root level (/). This library sets the following cookies:</p>
<p><strong>_utma</strong> — The _utma cookie is part of Google analytics, and is primarily used to track visits to any site that uses Google analytics. _utma stores the number of visits made from your device, the time of the first visit, the previous visit, and the current visit. This cookie does not contain any personal information other than the IP address of your device. This is a third-party cookie.</p>
<p><strong>_utmb</strong> — This cookie is used to establish and continue a user session with your site. When a user views a page on your site, the Google Analytics code attempts to update this cookie. If it does not find the cookie, a new one is written and a new session is established. Each time a user visits a different page on your site, this cookie is updated to expire in 30 minutes, thus continuing a single session for as long as user activity continues within 30-minute intervals. This cookie expires when a user pauses on a page on your site for longer than 30 minutes.</p>
<p><strong>_utmc</strong> — This cookie is no longer used by the ga.js tracking code to determine session status. Historically, this cookie operated in conjunction with the __utmb cookie to determine whether or not to establish a new session for the user. For backwards compatibility purposes with sites still using the urchin.js tracking code, this cookie will continue to be written and will expire when the user exits the browser.</p>
<p><strong>_utmz</strong> — This cookie stores the type of referral used by the visitor to reach your site, whether via a direct method, a referring link, a website search, or a campaign such as an ad or an email link. It is used to calculate search engine traffic, ad campaigns and page navigation within your own site. The cookie is updated with each page view to your site.</p>
<p><strong>PHPSESSID</strong> — The PHPSESSID cookie is native to PHP and enables websites to store serialised state data. On this website it is used to establish a user session and to pass state data via a temporary cookie, which is commonly referred to as a session cookie. As the PHPSESSID cookie has no timed expiry, it disappears when the client is closed.</p>
`,
};
