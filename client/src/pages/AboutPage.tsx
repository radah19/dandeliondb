import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    // check if user is navigating from signup/login page
    const fromAuthPage = location.state?.from === 'auth';
    setShouldAnimate(!fromAuthPage);
    
    // clear state after checking so refresh works
    if (fromAuthPage) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className={`home-page ${shouldAnimate ? '' : 'no-animate'}`}> 
      <div className="hero-container">
        
        <div className="hero-top-section">
          <div className="hero-section">
            <div className="hero-content">
              <img src='/dandelion_banner.svg' />
              <p className="hero-description">DandelionDB is a tech solution made for independent toy stores. It was made for a few reasons:</p>

              <ul className="hero-description">
                <li>Toy vendors often ship products with missing information, such as missing identifiers (UPC, SKU, EAN), weight, descriptions, etc. This often requires the toy store owner to find/create this information themselves.</li>
                <li>Independent toy stores receive a lot of inventory daily compared to other businesses, leading to more products needing to be entered onto inventory management systems.</li>
                <li>Many other similar businesses with high inventory intake, such as book stores, often already have tech solutions to support them in this regard. Toy stores do not and are largely underrepresented in the B2B tech solution space.</li>
                <li>Independent toy stores often don't have many employees to take on the work of manual data entry, causing the owner/manager to spend time on data entry where it would've been better spent on other important tasks.</li>
              </ul>

              <p className="hero-description">As a result, we created DandelionDB to address these issues. DandelionDB includes</p>
              
              <ul className="hero-description">
                <li>An extensive product database for toy information, descriptions, images, etc.</li>
                <li>A <a href="https://chromewebstore.google.com/detail/omeglncdkidhobknafnjbohkpckcoood?utm_source=item-share-cb/">browser extension</a> to enable autofilling product information from DandelionDB onto a toy store's IMS/storepage (Note: currently there is only support for BigCommerce and Lightspeed).</li>
                <li>An advanced search system on the website, intended to assist toy stores with finding a product if the product's name and identifiers aren't known.</li>
                <li>The ability to generate a new description for a product using AI.</li>
              </ul>
              
              <p className="hero-description">Currently, the database is lacking a large amount of data. We may work on this in the future if we find the time!</p>
              <p className="hero-description">DandedlionDB was made for the Georgia Tech Entrepreneurial Capstone class (CS 4803 ICD).</p>
            </div>
          </div>
        </div>
          
      </div>
    </div>
  );
}

export default AboutPage;
