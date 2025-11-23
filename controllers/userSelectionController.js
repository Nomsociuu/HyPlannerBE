const UserSelection = require("../models/UserSelection");
const mixpanel = require("../service/mixpanelServer");
const Album = require("../models/Album");

// User Selection Controllers
exports.createSelection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.body;

    if (
      !type ||
      ![
        "wedding-dress",
        "vest",
        "bride-engage",
        "groom-engage",
        "tone-color",
        "wedding-venue",
        "wedding-theme",
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Type is required and must be "wedding-dress", "vest", "bride-engage", "groom-engage", "tone-color", "wedding-venue", or "wedding-theme"',
      });
    }

    let selectionData = {
      user: userId,
      type,
      isPinned: true,
    };

    if (type === "wedding-dress") {
      const {
        styleIds,
        materialIds,
        necklineIds,
        detailIds,
        veilIds,
        jewelryIds,
        hairpinIds,
        crownIds,
        flowerIds,
      } = req.body;

      selectionData = {
        ...selectionData,
        styles: styleIds || [],
        materials: materialIds || [],
        necklines: necklineIds || [],
        details: detailIds || [],
        accessories: {
          veils: veilIds || [],
          jewelries: jewelryIds || [],
          hairpins: hairpinIds || [],
          crowns: crownIds || [],
        },
        flowers: flowerIds || [],
      };
    } else if (type === "vest") {
      const {
        vestStyleIds,
        vestColorIds,
        vestMaterialIds,
        vestLapelIds,
        vestPocketIds,
        vestDecorationIds,
      } = req.body;

      selectionData = {
        ...selectionData,
        vestStyles: vestStyleIds || [],
        vestColors: vestColorIds || [],
        vestMaterials: vestMaterialIds || [],
        vestLapels: vestLapelIds || [],
        vestPockets: vestPocketIds || [],
        vestDecorations: vestDecorationIds || [],
      };
    } else if (type === "bride-engage") {
      const {
        brideEngageStyleIds,
        brideEngageMaterialIds,
        brideEngagePatternIds,
        brideEngageHeadwearIds,
      } = req.body;

      selectionData = {
        ...selectionData,
        brideEngageStyles: brideEngageStyleIds || [],
        brideEngageMaterials: brideEngageMaterialIds || [],
        brideEngagePatterns: brideEngagePatternIds || [],
        brideEngageHeadwears: brideEngageHeadwearIds || [],
      };
    } else if (type === "groom-engage") {
      const { groomEngageOutfitIds, groomEngageAccessoryIds } = req.body;

      selectionData = {
        ...selectionData,
        groomEngageOutfits: groomEngageOutfitIds || [],
        groomEngageAccessories: groomEngageAccessoryIds || [],
      };
    } else if (type === "tone-color") {
      const { weddingToneColorIds, engageToneColorIds } = req.body;

      selectionData = {
        ...selectionData,
        weddingToneColors: weddingToneColorIds || [],
        engageToneColors: engageToneColorIds || [],
      };
    } else if (type === "wedding-venue") {
      const { weddingVenueIds } = req.body;

      selectionData = {
        ...selectionData,
        weddingVenues: weddingVenueIds || [],
      };
    } else if (type === "wedding-theme") {
      const { weddingThemeIds } = req.body;

      selectionData = {
        ...selectionData,
        weddingThemes: weddingThemeIds || [],
      };
    }

    // Remove any existing pinned selection of the same type
    await UserSelection.findOneAndDelete({
      user: userId,
      type,
      isPinned: true,
    });

    // Create new selection
    let selection = await UserSelection.create(selectionData);

    // Populate based on type
    if (type === "wedding-dress") {
      await selection.populate([
        "styles",
        "materials",
        "necklines",
        "details",
        "accessories.veils",
        "accessories.jewelries",
        "accessories.hairpins",
        "accessories.crowns",
        "flowers",
      ]);
    } else if (type === "vest") {
      await selection.populate([
        "vestStyles",
        "vestColors",
        "vestMaterials",
        "vestLapels",
        "vestPockets",
        "vestDecorations",
      ]);
    } else if (type === "bride-engage") {
      await selection.populate([
        "brideEngageStyles",
        "brideEngageMaterials",
        "brideEngagePatterns",
        "brideEngageHeadwears",
      ]);
    } else if (type === "groom-engage") {
      await selection.populate([
        "groomEngageOutfits",
        "groomEngageAccessories",
      ]);
    } else if (type === "tone-color") {
      await selection.populate(["weddingToneColors", "engageToneColors"]);
    } else if (type === "wedding-venue") {
      await selection.populate(["weddingVenues"]);
    } else if (type === "wedding-theme") {
      await selection.populate(["weddingThemes"]);
    }

    // Track với Mixpanel
    mixpanel.track("Wedding Style - Selection Made", {
      distinct_id: userId.toString(),
      selectionType: type,
      selectionId: selection._id.toString(),
    });

    res.status(200).json({
      success: true,
      data: selection,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSelection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    if (
      !type ||
      ![
        "wedding-dress",
        "vest",
        "bride-engage",
        "groom-engage",
        "tone-color",
        "wedding-venue",
        "wedding-theme",
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Type is required and must be "wedding-dress", "vest", "bride-engage", "groom-engage", "tone-color", "wedding-venue", or "wedding-theme"',
      });
    }

    // Find and delete the pinned selection of specified type
    const selection = await UserSelection.findOneAndDelete({
      user: userId,
      type,
      isPinned: true,
    });

    if (!selection) {
      return res.status(404).json({
        success: false,
        message: `No pinned ${type} selection found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${type} selection unpinned and removed`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserSelections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    let query = {
      user: userId,
      isPinned: true,
    };

    if (
      type &&
      [
        "wedding-dress",
        "vest",
        "bride-engage",
        "groom-engage",
        "tone-color",
        "wedding-venue",
        "wedding-theme",
      ].includes(type)
    ) {
      query.type = type;
    }

    const selections = await UserSelection.find(query);

    // Populate based on each selection's type
    for (let selection of selections) {
      if (selection.type === "wedding-dress") {
        await selection.populate([
          "styles",
          "materials",
          "necklines",
          "details",
          "accessories.veils",
          "accessories.jewelries",
          "accessories.hairpins",
          "accessories.crowns",
          "flowers",
        ]);
      } else if (selection.type === "vest") {
        await selection.populate([
          "vestStyles",
          "vestColors",
          "vestMaterials",
          "vestLapels",
          "vestPockets",
          "vestDecorations",
        ]);
      } else if (selection.type === "bride-engage") {
        await selection.populate([
          "brideEngageStyles",
          "brideEngageMaterials",
          "brideEngagePatterns",
          "brideEngageHeadwears",
        ]);
      } else if (selection.type === "groom-engage") {
        await selection.populate([
          "groomEngageOutfits",
          "groomEngageAccessories",
        ]);
      } else if (selection.type === "tone-color") {
        await selection.populate(["weddingToneColors", "engageToneColors"]);
      } else if (selection.type === "wedding-venue") {
        await selection.populate(["weddingVenues"]);
      } else if (selection.type === "wedding-theme") {
        await selection.populate(["weddingThemes"]);
      }
    }

    res.status(200).json({
      success: true,
      data: selections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Album Controllers
exports.createAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, note, type } = req.body;

    if (
      !type ||
      ![
        "wedding-dress",
        "vest",
        "bride-engage",
        "groom-engage",
        "tone-color",
        "wedding-venue",
        "wedding-theme",
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Type is required and must be "wedding-dress", "vest", "bride-engage", "groom-engage", or "tone-color"',
      });
    }

    // Get current pinned selection of specified type
    const currentSelection = await UserSelection.findOne({
      user: userId,
      type,
      isPinned: true,
    });

    if (!currentSelection) {
      return res.status(400).json({
        success: false,
        message: `No pinned ${type} selections found`,
      });
    }

    // Populate based on type
    if (type === "wedding-dress") {
      await currentSelection.populate([
        "styles",
        "materials",
        "necklines",
        "details",
        "accessories.veils",
        "accessories.jewelries",
        "accessories.hairpins",
        "accessories.crowns",
        "flowers",
      ]);
    } else if (type === "vest") {
      await currentSelection.populate([
        "vestStyles",
        "vestColors",
        "vestMaterials",
        "vestLapels",
        "vestPockets",
        "vestDecorations",
      ]);
    } else if (type === "bride-engage") {
      await currentSelection.populate([
        "brideEngageStyles",
        "brideEngageMaterials",
        "brideEngagePatterns",
        "brideEngageHeadwears",
      ]);
    } else if (type === "groom-engage") {
      await currentSelection.populate([
        "groomEngageOutfits",
        "groomEngageAccessories",
      ]);
    } else if (type === "tone-color") {
      await currentSelection.populate([
        "weddingToneColors",
        "engageToneColors",
      ]);
    } else if (type === "wedding-venue") {
      await currentSelection.populate(["weddingVenues"]);
    } else if (type === "wedding-theme") {
      await currentSelection.populate(["weddingThemes"]);
    }

    // Create a new selection with the same choices but unpinned
    let newSelectionData = {
      user: userId,
      type,
      isPinned: false,
    };

    if (type === "wedding-dress") {
      newSelectionData = {
        ...newSelectionData,
        styles: currentSelection.styles.map((style) => style._id),
        materials: currentSelection.materials.map((material) => material._id),
        necklines: currentSelection.necklines.map((neckline) => neckline._id),
        details: currentSelection.details.map((detail) => detail._id),
        accessories: {
          veils: currentSelection.accessories.veils.map((veil) => veil._id),
          jewelries: currentSelection.accessories.jewelries.map(
            (jewelry) => jewelry._id
          ),
          hairpins: currentSelection.accessories.hairpins.map(
            (hairpin) => hairpin._id
          ),
          crowns: currentSelection.accessories.crowns.map((crown) => crown._id),
        },
        flowers: currentSelection.flowers.map((flower) => flower._id),
      };
    } else if (type === "vest") {
      newSelectionData = {
        ...newSelectionData,
        vestStyles: currentSelection.vestStyles.map((style) => style._id),
        vestColors: currentSelection.vestColors.map((color) => color._id),
        vestMaterials: currentSelection.vestMaterials.map(
          (material) => material._id
        ),
        vestLapels: currentSelection.vestLapels.map((lapel) => lapel._id),
        vestPockets: currentSelection.vestPockets.map((pocket) => pocket._id),
        vestDecorations: currentSelection.vestDecorations.map(
          (decoration) => decoration._id
        ),
      };
    } else if (type === "bride-engage") {
      newSelectionData = {
        ...newSelectionData,
        brideEngageStyles: currentSelection.brideEngageStyles.map(
          (style) => style._id
        ),
        brideEngageMaterials: currentSelection.brideEngageMaterials.map(
          (material) => material._id
        ),
        brideEngagePatterns: currentSelection.brideEngagePatterns.map(
          (pattern) => pattern._id
        ),
        brideEngageHeadwears: currentSelection.brideEngageHeadwears.map(
          (headwear) => headwear._id
        ),
      };
    } else if (type === "groom-engage") {
      newSelectionData = {
        ...newSelectionData,
        groomEngageOutfits: currentSelection.groomEngageOutfits.map(
          (outfit) => outfit._id
        ),
        groomEngageAccessories: currentSelection.groomEngageAccessories.map(
          (accessory) => accessory._id
        ),
      };
    } else if (type === "tone-color") {
      newSelectionData = {
        ...newSelectionData,
        weddingToneColors: currentSelection.weddingToneColors.map(
          (color) => color._id
        ),
        engageToneColors: currentSelection.engageToneColors.map(
          (color) => color._id
        ),
      };
    } else if (type === "wedding-venue") {
      newSelectionData = {
        ...newSelectionData,
        weddingVenues: currentSelection.weddingVenues.map((venue) => venue._id),
      };
    } else if (type === "wedding-theme") {
      newSelectionData = {
        ...newSelectionData,
        weddingThemes: currentSelection.weddingThemes.map((theme) => theme._id),
      };
    }

    const newSelection = await UserSelection.create(newSelectionData);

    // Create the album with the new selection
    const album = await Album.create({
      user: userId,
      name,
      selections: [newSelection._id],
      note,
    });

    await album.populate({
      path: "selections",
    });

    // Populate selections based on their type
    for (let selection of album.selections) {
      if (selection.type === "wedding-dress") {
        await selection.populate([
          "styles",
          "materials",
          "necklines",
          "details",
          "accessories.veils",
          "accessories.jewelries",
          "accessories.hairpins",
          "accessories.crowns",
          "flowers",
        ]);
      } else if (selection.type === "vest") {
        await selection.populate([
          "vestStyles",
          "vestColors",
          "vestMaterials",
          "vestLapels",
          "vestPockets",
          "vestDecorations",
        ]);
      } else if (selection.type === "bride-engage") {
        await selection.populate([
          "brideEngageStyles",
          "brideEngageMaterials",
          "brideEngagePatterns",
          "brideEngageHeadwears",
        ]);
      } else if (selection.type === "groom-engage") {
        await selection.populate([
          "groomEngageOutfits",
          "groomEngageAccessories",
        ]);
      } else if (selection.type === "tone-color") {
        await selection.populate(["weddingToneColors", "engageToneColors"]);
      }
    }

    res.status(201).json({
      success: true,
      data: album,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserAlbums = async (req, res) => {
  try {
    const userId = req.user._id;
    const albums = await Album.find({ user: userId }).populate({
      path: "selections",
    });

    // Populate selections based on their type
    for (let album of albums) {
      for (let selection of album.selections) {
        if (selection.type === "wedding-dress") {
          await selection.populate([
            "styles",
            "materials",
            "necklines",
            "details",
            "accessories.veils",
            "accessories.jewelries",
            "accessories.hairpins",
            "accessories.crowns",
            "flowers",
          ]);
        } else if (selection.type === "vest") {
          await selection.populate([
            "vestStyles",
            "vestColors",
            "vestMaterials",
            "vestLapels",
            "vestPockets",
            "vestDecorations",
          ]);
        } else if (selection.type === "bride-engage") {
          await selection.populate([
            "brideEngageStyles",
            "brideEngageMaterials",
            "brideEngagePatterns",
            "brideEngageHeadwears",
          ]);
        } else if (selection.type === "groom-engage") {
          await selection.populate([
            "groomEngageOutfits",
            "groomEngageAccessories",
          ]);
        } else if (selection.type === "tone-color") {
          await selection.populate(["weddingToneColors", "engageToneColors"]);
        } else if (selection.type === "wedding-venue") {
          await selection.populate(["weddingVenues"]);
        } else if (selection.type === "wedding-theme") {
          await selection.populate(["weddingThemes"]);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: albums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
