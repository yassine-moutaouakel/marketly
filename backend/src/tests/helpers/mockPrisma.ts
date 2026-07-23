const createMockFunction = () => jest.fn();

export const mockPrisma = {
  $connect: createMockFunction(),
  $disconnect: createMockFunction(),
  $transaction: createMockFunction(),
  user: {
    findUnique: createMockFunction(),
    create: createMockFunction(),
    update: createMockFunction(),
    count: createMockFunction()
  },
  address: {
    findMany: createMockFunction(),
    findFirst: createMockFunction(),
    create: createMockFunction(),
    update: createMockFunction(),
    updateMany: createMockFunction(),
    delete: createMockFunction(),
    count: createMockFunction(),
    upsert: createMockFunction()
  },
  shop: {
    findUnique: createMockFunction(),
    findMany: createMockFunction(),
    create: createMockFunction(),
    update: createMockFunction(),
    count: createMockFunction()
  },
  category: {
    findUnique: createMockFunction(),
    findMany: createMockFunction(),
    create: createMockFunction()
  },
  product: {
    findUnique: createMockFunction(),
    findMany: createMockFunction(),
    create: createMockFunction(),
    update: createMockFunction(),
    updateMany: createMockFunction(),
    delete: createMockFunction(),
    count: createMockFunction(),
    upsert: createMockFunction()
  },
  productImage: {
    deleteMany: createMockFunction(),
    createMany: createMockFunction()
  },
  cart: {
    findUnique: createMockFunction(),
    upsert: createMockFunction()
  },
  cartItem: {
    findUnique: createMockFunction(),
    upsert: createMockFunction(),
    update: createMockFunction(),
    delete: createMockFunction(),
    deleteMany: createMockFunction()
  },
  order: {
    findMany: createMockFunction(),
    findUnique: createMockFunction(),
    create: createMockFunction(),
    update: createMockFunction(),
    updateMany: createMockFunction(),
    count: createMockFunction()
  }
};

const resetNestedMocks = (value: unknown) => {
  if (jest.isMockFunction(value)) {
    value.mockReset();
    return;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      resetNestedMocks(nestedValue);
    }
  }
};

export const resetPrismaMocks = () => {
  resetNestedMocks(mockPrisma);
  mockPrisma.$transaction.mockImplementation(async (callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockPrisma);
    }

    return callback;
  });
};
