import { Phone, MapPin, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export const contactData = {
  title: "Butuh Bantuan Langsung?",
  items: [
    {
      icon: Phone,
      label: "Layanan Telepon",
      value: "0800-123-4567",
      type: "phone",
    },
    {
      icon: Mail,
      label: "Email",
      value: "bantuan@desasejahtera.go.id",
      type: "email",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp Care Center",
      value: "+62 812-3456-7890",
      type: "whatsapp",
    },
    {
      icon: MapPin,
      label: "Alamat",
      value:
        "Gedung Pelayanan Sosial Terpadu\nJl. Kemerdekaan No. 45, Kota Bahagia",
      type: "address",
    },
  ],
};
