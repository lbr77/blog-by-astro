/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        config: {
            siteConfig: {
                title: string;
                author: string;
                desc: string;
                website: string;
                locale: string;
                twitter: string;
                mail: string;
                navs: {
                    text: string;
                    link: string;
                }[];
            };
            themeConfig: {
                defaultBanner: string;
                indexBannerTitle: string;
                indexBannerSubtitle: string;
                colorScheme: number;
                indexStyle: number;
                reward: string;
                serifincontent: boolean;
                lazyload: boolean;
                enableMath: boolean;
                head: string;
                footer: string;
                pjax: boolean;
                pjaxreload: string;
                serviceWorker: string;
                brandFont: {
                    src: string;
                    style: string;
                    weight: string;
                };
                desktopBannerHeight: number;
                mobileBannerHeight: number;
                headerMode: number;
                headerModeMobile: number;
                defaultFontSize: number;
                useFiraCodeFont: boolean;
                parseFigcaption: boolean;
                twitterId: string;
                darkModeTime: {
                    start: number;
                    end: number;
                };
                followSystemColorScheme: boolean;
                largePhotoSet: boolean;
                browserLevelLoadingLazy: boolean;
                macStyleCodeBlock: boolean;
                lineNumbers: boolean;
                link: {
                    name: string;
                    icon: string;
                    href: string;
                    target: string;
                }[];
                nav: {
                    name: string;
                    title: string;
                }[];
                version: string;
            };
        };
        translate: (key: string, param?: string | number) => string;
    }
}
