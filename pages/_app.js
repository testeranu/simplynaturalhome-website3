import axios from 'axios';
import App from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import '../styles/globals.css';
import config from '../config';

const Header = ({ siteName, menuItems }) => (
  <header className="app-header">
    <h1><a href="/">{siteName}</a></h1>
    <nav>
      {Object.entries(menuItems).map(([name, url]) => (
        <Link href={url} key={name}>
          <a className="nav-link">{name}</a>
        </Link>
      ))}
    </nav>
  </header>
);

const Footer = ({ siteName }) => (
  <footer className="app-footer">
    <div className="SiteMap">
      <p><a href='/sitemap'>sitemap</a></p>
    </div>
    <p>Copyright © {new Date().getFullYear()} {siteName}. All rights reserved.</p>
  </footer>
);

class MyApp extends App {
  static async getInitialProps(appContext) {
    const appProps = await App.getInitialProps(appContext);
    
    let domainStyles = '';
    let siteName = 'Default Site Name';
    let menuItems = {};

    try {
      const styleResponse = await axios.get(`${process.env.STRAPI_STYLING}`, {
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`
        }
      });
      const styles = styleResponse.data.data.attributes.DomainGlobalStyles[config.HARDCODED_DOMAIN];
      domainStyles = Object.entries(styles).reduce((acc, [key, value]) => {
        return `${acc}${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val};`).join(' ')} } `;
      }, '');

      const articleResponse = await axios.get(config.API_URL, {
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`
        }
      });
      const homeArticle = articleResponse.data.data.find(
        article => 
          article.attributes.Domain === config.HARDCODED_DOMAIN &&
          article.attributes.urlSlug === '/'
      );
      if (homeArticle && homeArticle.attributes.SiteName) {
        siteName = homeArticle.attributes.SiteName;
      }

      const menuResponse = await axios.get(config.STRAPI_MENU_API, {
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`
        }
      });
      menuItems = menuResponse.data.data.attributes.menu[config.HARDCODED_DOMAIN] || {};

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    
    return { ...appProps, domainStyles, siteName, menuItems };
  }

  render() {
    const { Component, pageProps, domainStyles, siteName, menuItems } = this.props;
    return (
      <>
        <Head>
          <style>{domainStyles}</style>
        </Head>
        <Header siteName={siteName} menuItems={menuItems} />
        <main style={{ paddingBottom: '120px' }}>
          <Component {...pageProps} />
        </main>
        <Footer siteName={siteName} />
      </>
    );
  }
}

export default MyApp;
