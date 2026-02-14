'use client';

import Breadcrumb from '@/ui/breadcrumb';
import cn from '@/utils/class-names';
import { usePathname } from 'next/navigation';
import { Title } from 'rizzui/typography';

export default function HeaderBreadcrumb() {
    const pathname = usePathname();

    const generateBreadcrumbs = () => {
        // Remove query parameters and trailing slash
        const pathWithoutQuery = pathname.split('?')[0];
        const path = pathWithoutQuery.endsWith('/')
            ? pathWithoutQuery.slice(0, -1)
            : pathWithoutQuery;

        const segments = path.split('/').filter((v) => v.length > 0);

        const breadcrumbs = [
            {
                href: '/',
                name: 'Home',
            },
        ];

        let currentPath = '';

        segments.forEach((segment) => {
            currentPath += `/${segment}`;

            // Convert kebab-case to Title Case
            const name = segment
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            breadcrumbs.push({
                href: currentPath,
                name: name,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();
    const title = breadcrumbs.length > 1
        ? breadcrumbs[breadcrumbs.length - 1].name
        : 'Home';

    // If we are at root, we might want to handle it differently or just show "Home"
    if (pathname === '/') {
        return null;
    }

    return (
        <div className={cn('')}>
            <Title
                as="h2"
                className="text-lg font-semibold text-primary"
            >
                {title}
            </Title>

            <Breadcrumb
                separator=""
                separatorVariant="circle"
                className="flex items-center gap-2"
            >
                {breadcrumbs.map((item) => (
                    <Breadcrumb.Item
                        key={item.name}
                        {...(item?.href && { href: item?.href })}
                    >
                        {item.name}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </div>
    );
}
