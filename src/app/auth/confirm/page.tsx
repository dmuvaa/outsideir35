import Link from 'next/link';
import { continueFromEmail } from '@/app/actions/auth';

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;
  const code = params.code || '';
  const tokenHash = params.token_hash || '';
  const type = params.type || '';
  const hasLink = Boolean(code || (tokenHash && type));

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
          {hasLink ? 'Continue' : 'You are all set'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
          {hasLink
            ? 'Continue to finish opening your account.'
            : 'Sign in with your email and password.'}
        </p>
        {hasLink ? (
          <form action={continueFromEmail}>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Continue
            </button>
          </form>
        ) : (
          <Link href="/login?notice=confirmed" className="btn btn-primary" style={{ width: '100%' }}>
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
