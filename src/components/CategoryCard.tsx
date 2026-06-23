/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  name: string;
  image: string;
  href?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, href }) => {
  const content = (
    <>
      <div className="aspect-3/4 rounded-4xl overflow-hidden mb-6 relative shadow-lg">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          alt={name}
          src={image}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      </div>
      <h3 className="font-sans font-black text-xl md:text-2xl text-center group-hover:text-secondary transition-colors tracking-tight">
        {name}
      </h3>
    </>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
    >
      {href ? (
        <Link to={href} className="block" aria-label={`View ${name} offers`}>
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
};

export default CategoryCard;
