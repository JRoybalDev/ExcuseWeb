import prisma from '@/lib/prisma';

export default async function TestPage() {
  const userCount = await prisma.user.count();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Database Test</h1>
      <p>User count: {userCount}</p>
      <p className="text-green-600">✓ Prisma is working!</p>
    </div>
  );
}
