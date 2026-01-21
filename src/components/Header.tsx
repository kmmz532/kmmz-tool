'use client';

import Link from "next/link";

export default function Header() {
    return (
        <div className="header">
            <nav>
                <ul>
                    <li><Link href="/" className="title">Kmmz-Tool</Link></li>
                    <li className="right"><Link href="https://kmmz532.github.io/" target="_blank">Profile</Link></li>
                </ul>
            </nav>
        </div>
    );
}
