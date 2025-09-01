"use server";

import { Result } from "@/interfaces/result.interface";
import { withAuth } from "@/lib/auth";
import { SCREENSHOT_BUCKET_ID } from "@/lib/constants";
import { createSessionClient } from "@/lib/server/appwrite";

import { ID, Models, Permission, Role } from "node-appwrite";

/**
 * Uploads a Screenshot image.
 * @param {Object} params The parameters for creating a Screenshot image
 * @param {string} [params.id] The ID of the Screenshot
 * @param {File} params.data The image data
 * @param {string[]} [params.permissions] The permissions for the image (optional)
 * @returns {Promise<Result<Models.File>>} The file
 */
export async function uploadScreenshotImage({
  id = ID.unique(),
  data,
  permissions = [],
}: {
  id?: string;
  data: File;
  permissions?: string[];
}): Promise<Result<Models.File>> {
  return withAuth(async (user) => {
    const { storage } = await createSessionClient();

    permissions = [
      ...permissions,
      Permission.read(Role.user(user.$id)),
      Permission.write(Role.user(user.$id)),
      Permission.read(Role.any()),
    ];

    try {
      const response = await storage.createFile(
        SCREENSHOT_BUCKET_ID,
        id,
        data,
        permissions
      );

      return {
        success: true,
        message: "Screenshot image uploaded successfully.",
        data: response,
      };
    } catch (err) {
      const error = err as Error;

      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}

/**
 * Deletes a Screenshot image.
 * @param {string} id
 * @returns {Promise<Result<undefined>>} A promise that resolves to a result object.
 */
export async function deleteScreenshotImage(
  id: string
): Promise<Result<undefined>> {
  return withAuth(async () => {
    const { storage } = await createSessionClient();

    try {
      await storage.deleteFile(SCREENSHOT_BUCKET_ID, id);

      return {
        success: true,
        message: "Screenshot image successfully deleted.",
      };
    } catch (err) {
      const error = err as Error;

      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}
