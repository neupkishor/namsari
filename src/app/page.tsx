import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import { initMapper } from '@/mapper';

export default async function HomePage() {
    const session = await getSession();
    let user = null;

    if (session) {
        const mapper = initMapper();
        user = await mapper.use('users').where('id', session.id).getOne();
    }

    return <HomeClient user={user} />;
}
