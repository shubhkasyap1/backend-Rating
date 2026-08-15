import prisma from "../config/database.js";

export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get owner's stores
    const stores = await prisma.store.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
      },
    });

    const storeIds = stores.map((store) => store.id);

    // No stores
    if (storeIds.length === 0) {
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
          recentRatings: [],
        },
      });
    }

    // Rating statistics
    const [totalRatings, ratingStats, distribution] =
      await Promise.all([
        prisma.rating.count({
          where: {
            storeId: {
              in: storeIds,
            },
          },
        }),

        prisma.rating.aggregate({
          where: {
            storeId: {
              in: storeIds,
            },
          },
          _avg: {
            rating: true,
          },
        }),

        prisma.rating.groupBy({
          by: ["rating"],
          where: {
            storeId: {
              in: storeIds,
            },
          },
          _count: {
            rating: true,
          },
          orderBy: {
            rating: "asc",
          },
        }),
      ]);

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach((item) => {
      ratingDistribution[item.rating] =
        item._count.rating;
    });

    // Recent ratings
    const recentRatings = await prisma.rating.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
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
      data: {
        stores,

        summary: {
          totalStores: stores.length,
          totalRatings,
          averageRating:
            ratingStats._avg.rating !== null
              ? Number(
                  ratingStats._avg.rating.toFixed(2)
                )
              : null,
          ratingDistribution,
        },

        recentRatings,
      },
    });
  } catch (error) {
    console.error(
      "Get owner dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};