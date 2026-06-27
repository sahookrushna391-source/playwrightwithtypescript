import { faker } from '@faker-js/faker';
import type { CheckoutInfo, User, UserType } from '../types';

export const TestUsers: Record<UserType, User> = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
  },
  locked: {
    username: process.env.LOCKED_USER ?? 'locked_out_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
  },
  problem: {
    username: process.env.PROBLEM_USER ?? 'problem_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
  },
  performance: {
    username: process.env.PERFORMANCE_USER ?? 'performance_glitch_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
  },
};

export const generateCheckoutInfo = (): CheckoutInfo => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode('#####'),
});

export const generateInvalidUser = (): User => ({
  username: faker.internet.username(),
  password: faker.internet.password({ length: 12 }),
});

export const CheckoutData: Record<'standard', CheckoutInfo> = {
  standard: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '10001',
  },
};
