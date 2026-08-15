import bcrypt from "bcryptjs";

import prisma from "../config/database.js";
import { createUserSchema } from "../validators/admin.validator.js";

export const createUser = async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);

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
      password,
      address,
      role,
    } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      page = "1",
      limit = "10",
    } = req.query;

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

    const where = {};

    if (role) {
      if (
        !["ADMIN", "USER", "STORE_OWNER"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter",
        });
      }

      where.role = role;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,

        skip: (pageNumber - 1) * limitNumber,

        take: limitNumber,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ratings: true,
              stores: true,
            },
          },
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,

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
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};