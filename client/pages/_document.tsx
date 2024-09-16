import Document, {
  Html,
  Main,
  NextScript,
  DocumentInitialProps,
  DocumentContext,
  Head,
} from 'next/document';
// import Head from "next/head"

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* <title>My page title</title> */}
          <meta property='og:title' content='My page title' key='title' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
