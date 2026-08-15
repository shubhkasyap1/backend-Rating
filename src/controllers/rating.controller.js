import prisma from "../config/database.js";

import {
  createRatingSchema,
  updateRatingSchema,
} from "../validators/rating.validator.js";

export const createRating = async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = createRatingSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { rating, comment } = result.data;

    // Check store
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Check if user already rated this store
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message:
          "You have already rated this store. Update your existing rating instead.",
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        comment,
        userId: req.user.id,
        storeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        rating: newRating,
      },
    });
  } catch (error) {
    console.error("Create rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = updateRatingSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: "You have not rated this store yet",
      });
    }

    const updatedRating = await prisma.rating.update({
      where: {
        id: existingRating.id,
      },
      data: result.data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: {
        rating: updatedRating,
      },
    });
  } catch (error) {
    console.error("Update rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const ratings = await prisma.rating.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalRatings = ratings.length;

    const averageRating =
      totalRatings > 0
        ? ratings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / totalRatings
        : null;

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
        },
        summary: {
          averageRating:
            averageRating !== null
              ? Number(averageRating.toFixed(2))
              : null,
          totalRatings,
        },
        ratings,
      },
    });
  } catch (error) {
    console.error("Get store ratings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyRatings = async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ratings,
      },
    });
  } catch (error) {
    console.error("Get my ratings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Owner Ratings
export const getOwnerRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const {
      storeId,
      rating,
      search,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // -----------------------------
    // Pagination
    // -----------------------------

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      100
    );

    // -----------------------------
    // Rating validation
    // -----------------------------

    let ratingNumber;

    if (rating !== undefined) {
      ratingNumber = Number.parseInt(rating, 10);

      if (
        Number.isNaN(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating filter must be between 1 and 5",
        });
      }
    }

    // -----------------------------
    // Sort validation
    // -----------------------------

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "rating",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const safeSortOrder =
      sortOrder === "asc" ? "asc" : "desc";

    // -----------------------------
    // Get owner's stores
    // -----------------------------

    const stores = await prisma.store.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      },
    });

    const ownerStoreIds = stores.map(
      (store) => store.id
    );

    if (ownerStoreIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          stores: [],
          summary: {
            totalStores: 0,
            totalRatings: 0,
            averageRating: null,
            ratingDistribution: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
          },
          filters: {
            storeId: storeId || null,
            rating: ratingNumber || null,
            search: search || null,
            sortBy: safeSortBy,
            sortOrder: safeSortOrder,
          },
          ratings: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });
    }

    // -----------------------------
    // Prevent owner accessing
    // another owner's store
    // -----------------------------

    if (
      storeId &&
      !ownerStoreIds.includes(storeId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this store",
      });
    }

    // -----------------------------
    // Build filters
    // -----------------------------

    const where = {
      storeId: storeId
        ? storeId
        : {
            in: ownerStoreIds,
          },
    };

    if (ratingNumber !== undefined) {
      where.rating = ratingNumber;
    }

    if (search) {
      where.OR = [
        {
          store: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // -----------------------------
    // Get ratings + total
    // -----------------------------

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,

        skip: (pageNumber - 1) * limitNumber,

        take: limitNumber,

        orderBy: {
          [safeSortBy]: safeSortOrder,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.rating.count({
        where,
      }),
    ]);

    // -----------------------------
    // Summary
    // -----------------------------

    const allFilteredRatings =
      await prisma.rating.findMany({
        where,
        select: {
          rating: true,
        },
      });

    const totalRatings =
      allFilteredRatings.length;

    const averageRating =
      totalRatings > 0
        ? allFilteredRatings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / totalRatings
        : null;

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    allFilteredRatings.forEach((item) => {
      ratingDistribution[item.rating]++;
    });

    return res.status(200).json({
      success: true,

      data: {
        stores,

        summary: {
          totalStores: stores.length,
          totalRatings,
          averageRating:
            averageRating !== null
              ? Number(averageRating.toFixed(2))
              : null,
          ratingDistribution,
        },

        filters: {
          storeId: storeId || null,
          rating: ratingNumber || null,
          search: search || null,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        },

        ratings,

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
          hasNextPage:
            pageNumber <
            Math.ceil(total / limitNumber),
          hasPreviousPage:
            pageNumber > 1,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get owner ratings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin Ratings
export const getAdminRatings = async (req, res) => {
  try {
    const {
      storeId,
      rating,
      search,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // -----------------------------
    // Pagination
    // -----------------------------

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 10,
        1
      ),
      100
    );

    // -----------------------------
    // Rating validation
    // -----------------------------

    let ratingNumber;

    if (rating !== undefined) {
      ratingNumber = Number.parseInt(rating, 10);

      if (
        Number.isNaN(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating filter must be between 1 and 5",
        });
      }
    }

    // -----------------------------
    // Sort validation
    // -----------------------------

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "rating",
    ];

    const safeSortBy = allowedSortFields.includes(
      sortBy
    )
      ? sortBy
      : "createdAt";

    const safeSortOrder =
      sortOrder === "asc" ? "asc" : "desc";

    // -----------------------------
    // Build filters
    // -----------------------------

    const where = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (ratingNumber !== undefined) {
      where.rating = ratingNumber;
    }

    // Search by:
    // - store name
    // - store email
    // - store address
    // - user name
    // - user email
    if (search) {
      where.OR = [
        {
          store: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          store: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          store: {
            address: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // -----------------------------
    // Fetch ratings + count
    // -----------------------------

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,

        skip: (pageNumber - 1) * limitNumber,

        take: limitNumber,

        orderBy: {
          [safeSortBy]: safeSortOrder,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          store: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,

              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      prisma.rating.count({
        where,
      }),
    ]);

    // -----------------------------
    // Summary for filtered results
    // -----------------------------

    const filteredRatings = await prisma.rating.findMany({
      where,
      select: {
        rating: true,
      },
    });

    const totalFilteredRatings =
      filteredRatings.length;

    const averageRating =
      totalFilteredRatings > 0
        ? filteredRatings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / totalFilteredRatings
        : null;

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    filteredRatings.forEach((item) => {
      ratingDistribution[item.rating]++;
    });

    return res.status(200).json({
      success: true,

      data: {
        summary: {
          totalRatings: totalFilteredRatings,

          averageRating:
            averageRating !== null
              ? Number(averageRating.toFixed(2))
              : null,

          ratingDistribution,
        },

        filters: {
          storeId: storeId || null,
          rating: ratingNumber || null,
          search: search || null,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        },

        ratings,

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
          hasNextPage:
            pageNumber <
            Math.ceil(total / limitNumber),
          hasPreviousPage:
            pageNumber > 1,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get admin ratings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};