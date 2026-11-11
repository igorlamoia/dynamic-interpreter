import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";

interface IDEDocumentProps extends DocumentInitialProps {
  locale: string;
}

export default class IDEDocument extends Document<IDEDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<IDEDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      locale: ctx.locale ?? ctx.defaultLocale ?? "pt-BR",
    };
  }

  render() {
    return (
      <Html lang={this.props.locale}>
        <Head />
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
