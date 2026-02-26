import connectDB from './connection';
import { Tenant, User, Profile } from './models';
import { hashPassword } from '../utils/auth';

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing data (optional - comment out in production)
    // await Tenant.deleteMany({});
    // await User.deleteMany({});
    // await Profile.deleteMany({});

    // Create demo tenant
    const tenant = await Tenant.create({
      name: 'Demo Company',
      email: 'demo@lynq.com',
      subscriptionTier: 'pro',
      aiUsageLimit: 1000,
      aiUsageCount: 0,
    });

    console.log('✅ Created tenant:', tenant.name);

    // Create demo admin user
    const passwordHash = await hashPassword('demo123');
    const user = await User.create({
      tenantId: tenant._id,
      email: 'demo@lynq.com',
      passwordHash,
      name: 'Demo User',
      role: 'admin',
    });

    console.log('✅ Created user:', user.name);

    // Create demo profile
    const profile = await Profile.create({
      tenantId: tenant._id,
      userId: user._id,
      username: 'demo',
      displayName: 'Demo User',
      title: 'Product Manager',
      company: 'Demo Company',
      bio: 'Welcome to my LynQ profile! I help businesses streamline their lead generation.',
      avatar: '',
      coverImage: '',
      branding: {
        primaryColor: '#3b82f6',
        logo: '',
      },
      contactInfo: {
        email: 'demo@lynq.com',
        linkedin: 'https://linkedin.com/in/demo',
      },
      aiConfig: {
        enabled: true,
        personality: 'professional and friendly',
        greeting: 'Hello! Thanks for visiting my profile. How can I help you today?',
        qualificationQuestions: [
          'What brings you here today?',
          'Which industry are you in?',
          'What challenges are you currently facing?',
        ],
        autoBooking: true,
      },
      isPublic: true,
      language: 'en',
      timezone: 'America/New_York',
    });

    console.log('✅ Created profile:', profile.username);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Email: demo@lynq.com');
    console.log('Password: demo123');
    console.log('Profile URL: http://localhost:3000/demo');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
