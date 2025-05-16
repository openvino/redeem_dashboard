import {
	createWineBiodigitalData,
	getWineBiodigitalData,
	getWineBiodigitalDataById,
	getWinesBiodigitalData,
	updateWineBiodigitalData,
} from "../controllers/bioDigitalController";

export default async function handler(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	if (req.method === "POST") {
		try {
			const {
				wine,
				winery,
				birthdate,
				copper,
				cadmium,
				arsenic,
				zinc,
				lead,
				privates,
			} = req.body;

			const wineData = await createWineBiodigitalData({
				wine,
				winery,
				birthdate,
				copper,
				cadmium,
				arsenic,
				zinc,
				lead,
				privates,
			});

			console.log(wineData);

			// res.status(200).json(users);
			// const response = {
			//   exists: !!user,
			//   user: !!user ? user[0] : "",
			// };
			res.status(200).json({ wineData });
		} catch (error) {
			console.error("Error al crear el wineData:", error);
			res.status(500).json({ message: "Error al crear el wineData" });
		}
	}

	if (req.method === "GET") {
		try {
			const { wine } = req.query;

			if (wine) {
				console.log(wine);

				const wineData = await getWineBiodigitalData({ wine });

				res.status(200).json(wineData);
				console.log(wineData);
			}

			const winesData = await getWinesBiodigitalData();
			console.log(winesData);

			res.status(200).json(winesData);
		} catch (error) {
			console.error("Error", error);
			res.status(500).json({ message: "Cant get wines data" });
		}
		return;
	}
	if (req.method === "PUT") {
		try {
			const { wine, field, value } = req.body;

			if (!wine || !field || value === undefined) {
				res.status(400).json({
					message: "Wine, field, and value are required",
				});
				return;
			}

			const updatedWine = await updateWineBiodigitalData({
				wine,
				field,
				value,
			});

			res.status(200).json({ updatedWine });
		} catch (error) {
			console.error("Error al actualizar el Wine Biodigital Data:", error);
			res.status(500).json({
				message: "Error al actualizar el Wine Biodigital Data",
			});
		}
	}

	res.setHeader("Allow", ["GET", "POST", "PUT", "OPTIONS"]);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
