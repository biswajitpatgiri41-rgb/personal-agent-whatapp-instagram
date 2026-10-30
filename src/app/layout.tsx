import './globals.css'; import type {Metadata} from 'next';
export const metadata:Metadata={title:'Personal AI Reply Agent',description:'Secure AI messaging automation for official WhatsApp and Instagram APIs'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}