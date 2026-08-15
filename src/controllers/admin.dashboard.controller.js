import prisma from "../config/database.js";

export const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStoreOwners,
      totalAdmins,
      totalStores,
      totalRatings,
      ratingStats,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          role: "STORE_OWNER",
        },
      }),

      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),

      prisma.store.count(),

      prisma.rating.count(),

      prisma.rating.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    const ratingDistribution = await prisma.rating.groupBy({
      by: ["rating"],
      _count: {
        rating: true,
      },
      orderBy: {
        rating: "asc",
      },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating] = item._count.rating;
    });

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          storeOwners: totalStoreOwners,
        },

        stores: {
          total: totalStores,
        },

        ratings: {
          total: totalRatings,

          average:
            ratingStats._avg.rating !== null
              ? Number(
                  ratingStats._avg.rating.toFixed(2)
                )
              : null,

          distribution,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
