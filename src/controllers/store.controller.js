import prisma from "../config/database.js";
import {
  createStoreSchema,
  updateStoreSchema,
  ownerUpdateStoreSchema,
} from "../validators/store.validator.js";

export const createStore = async (req, res) => {
  try {
    const result = createStoreSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const {
      name,
      email,
      address,
      ownerId,
    } = result.data;

    const existingStore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "Store with this email already exists",
      });
    }

    let owner = null;

    if (ownerId) {
      owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Store owner not found",
        });
      }

      if (owner.role !== "STORE_OWNER") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not a store owner",
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: {
        store,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStores = async (req, res) => {
  try {
    const {
      search,
      address,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const where = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: "insensitive",
      };
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: {
          name: "asc",
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      }),

      prisma.store.count({ where }),
    ]);

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings.map(
        (item) => item.rating
      );

      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum, rating) => sum + rating,
              0
            ) / ratings.length
          : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        averageRating:
          averageRating !== null
            ? Number(averageRating.toFixed(2))
            : null,
        totalRatings: ratings.length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stores: formattedStores,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      },
    });
  } catch (error) {
    console.error("Get stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const ratings = store.ratings.map(
      (item) => item.rating
    );

    const averageRating =
      ratings.length > 0
        ? ratings.reduce(
            (sum, rating) => sum + rating,
            0
          ) / ratings.length
        : null;

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          owner: store.owner,
          averageRating:
            averageRating !== null
              ? Number(averageRating.toFixed(2))
              : null,
          totalRatings: ratings.length,
        },
      },
    });
  } catch (error) {
    console.error("Get store error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStore = await prisma.store.findUnique({
      where: {
        id,
      },
    });

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    let validatedData;

    // -----------------------------
    // ADMIN
    // -----------------------------

    if (req.user.role === "ADMIN") {
      const result = updateStoreSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors:
            result.error.flatten().fieldErrors,
        });
      }

      validatedData = result.data;
    }

    // -----------------------------
    // STORE OWNER
    // -----------------------------

    else if (req.user.role === "STORE_OWNER") {
      if (
        existingStore.ownerId !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only update your own store",
        });
      }

      const result =
        ownerUpdateStoreSchema.safeParse(
          req.body
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors:
            result.error.flatten().fieldErrors,
        });
      }

      validatedData = result.data;
    }

    else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission",
      });
    }

    const store = await prisma.store.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: {
        store,
      },
    });
  } catch (error) {
    console.error(
      "Update store error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    await prisma.store.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Delete store error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOwnerStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: {
        ownerId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings.map(
        (item) => item.rating
      );

      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum, value) => sum + value,
              0
            ) / ratings.length
          : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating:
          averageRating !== null
            ? Number(averageRating.toFixed(2))
            : null,
        totalRatings: ratings.length,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stores: formattedStores,
      },
    });
  } catch (error) {
    console.error("Get owner stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOwnerStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findFirst({
      where: {
        id,
        ownerId: req.user.id,
      },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const ratings = store.ratings.map(
      (item) => item.rating
    );

    const averageRating =
      ratings.length > 0
        ? ratings.reduce(
            (sum, value) => sum + value,
            0
          ) / ratings.length
        : null;

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating:
            averageRating !== null
              ? Number(averageRating.toFixed(2))
              : null,
          totalRatings: ratings.length,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get owner store error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};